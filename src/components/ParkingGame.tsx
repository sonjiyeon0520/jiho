import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { VehicleDefinition, ParkingLevel } from '../types/vehicle';
import { sound } from '../services/sound';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface Props {
  vehicle: VehicleDefinition;
  onGoToAssemble: () => void;
  onGoToInteractive: () => void;
  onNextVehicle: () => void;
}

export const ParkingGame: React.FC<Props> = ({
  vehicle,
  onGoToAssemble,
  onGoToInteractive,
  onNextVehicle,
}) => {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const currentLevel: ParkingLevel = vehicle.parkingLevels[levelIndex] || vehicle.parkingLevels[0];

  // Vehicle transform state on 800x500 canvas
  const [posX, setPosX] = useState<number>(currentLevel.startX);
  const [posY, setPosY] = useState<number>(currentLevel.startY);
  const [angle, setAngle] = useState<number>(currentLevel.startAngle);
  const [isParked, setIsParked] = useState<boolean>(false);
  const [stars, setStars] = useState<number>(3);
  const [bounces, setBounces] = useState<number>(0);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  // Input states
  const [heldKeys, setHeldKeys] = useState<{ [key: string]: boolean }>({});
  const [isDirectDragging, setIsDirectDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const loopRef = useRef<number | null>(null);

  // Initialize level
  useEffect(() => {
    setPosX(currentLevel.startX);
    setPosY(currentLevel.startY);
    setAngle(currentLevel.startAngle);
    setIsParked(false);
    setStars(3);
    setBounces(0);
    setTrail([]);
    sound.speak(`${currentLevel.name}에 주차해보세요! 손가락으로 차를 끌거나 화살표를 눌러보세요.`);
  }, [currentLevel.id, vehicle.id]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', 'W', 'S', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
        setHeldKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setHeldKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main vehicle physics simulation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!isParked) {
        let speed = 0;
        let turn = 0;

        const forward = heldKeys['arrowup'] || heldKeys['w'];
        const backward = heldKeys['arrowdown'] || heldKeys['s'];
        const left = heldKeys['arrowleft'] || heldKeys['a'];
        const right = heldKeys['arrowright'] || heldKeys['d'];

        if (forward) speed += 120;
        if (backward) speed -= 90;
        if (left) turn -= 110;
        if (right) turn += 110;

        if (speed !== 0 || turn !== 0) {
          sound.startDrivingEngine(speed > 0 ? 1.2 : 0.9);

          setAngle((a) => {
            const nextAngle = a + turn * dt * (speed < 0 ? -1 : 1);
            return (nextAngle + 360) % 360;
          });

          setPosX((x) => {
            const rad = (angle * Math.PI) / 180;
            const nextX = Math.max(60, Math.min(740, x + Math.cos(rad) * speed * dt));
            return nextX;
          });

          setPosY((y) => {
            const rad = (angle * Math.PI) / 180;
            const nextY = Math.max(60, Math.min(440, y + Math.sin(rad) * speed * dt));
            return nextY;
          });

          // Append tire track trail
          setTrail((tr) => {
            const last = tr[tr.length - 1];
            if (!last || Math.hypot(last.x - posX, last.y - posY) > 16) {
              const updated = [...tr, { x: posX, y: posY }];
              return updated.slice(-35); // Keep last 35 points
            }
            return tr;
          });

          // Check obstacle collisions
          currentLevel.obstacles.forEach((obs) => {
            const dist = Math.hypot(posX - (obs.x + obs.width / 2), posY - (obs.y + obs.height / 2));
            if (dist < 42) {
              sound.playBump();
              setBounces((b) => b + 1);
              // Push back slightly
              const rad = (angle * Math.PI) / 180;
              setPosX((px) => px - Math.cos(rad) * 12);
              setPosY((py) => py - Math.sin(rad) * 12);
            }
          });

          // Check parking slot arrival
          const distToTarget = Math.hypot(posX - currentLevel.targetX, posY - currentLevel.targetY);
          if (distToTarget < 42) {
            triggerVictory();
          }
        } else {
          sound.stopEngine();
        }
      }

      loopRef.current = requestAnimationFrame(loop);
    };

    loopRef.current = requestAnimationFrame(loop);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      sound.stopEngine();
    };
  }, [heldKeys, angle, posX, posY, isParked, currentLevel]);

  const triggerVictory = () => {
    if (isParked) return;
    setIsParked(true);
    sound.stopEngine();
    sound.playVictoryFanfare();
    setTimeout(() => sound.playHorn('car'), 700);

    const calculatedStars = Math.max(1, 3 - Math.floor(bounces / 3));
    setStars(calculatedStars);
    sound.speak('주차 대성공! 완벽하게 주차했어요!');

    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  // Direct finger dragging vehicle on touch screen
  const handlePointerDownVehicle = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDirectDragging(true);
    sound.startDrivingEngine(1.1);
  };

  const handlePointerMoveVehicle = (e: React.PointerEvent) => {
    if (!isDirectDragging || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / svgRect.width;
    const scaleY = 500 / svgRect.height;

    const newX = Math.max(60, Math.min(740, (e.clientX - svgRect.left) * scaleX));
    const newY = Math.max(60, Math.min(440, (e.clientY - svgRect.top) * scaleY));

    // Turn vehicle towards drag direction
    const dx = newX - posX;
    const dy = newY - posY;
    if (Math.hypot(dx, dy) > 4) {
      const targetDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      setAngle(targetDeg);
    }

    setPosX(newX);
    setPosY(newY);

    // Trail
    setTrail((tr) => [...tr, { x: newX, y: newY }].slice(-35));

    // Check parking arrival
    const distToTarget = Math.hypot(newX - currentLevel.targetX, newY - currentLevel.targetY);
    if (distToTarget < 45) {
      setIsDirectDragging(false);
      triggerVictory();
    }
  };

  const handlePointerUpVehicle = () => {
    setIsDirectDragging(false);
    sound.stopEngine();
  };

  const handleResetLevel = () => {
    setPosX(currentLevel.startX);
    setPosY(currentLevel.startY);
    setAngle(currentLevel.startAngle);
    setIsParked(false);
    setStars(3);
    setBounces(0);
    setTrail([]);
    sound.speak('다시 출발해볼까요?');
  };

  const handleNextLevelOrVehicle = () => {
    if (levelIndex < vehicle.parkingLevels.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else {
      onNextVehicle();
    }
  };

  // Calculate distance to target
  const distToGoal = Math.round(Math.hypot(posX - currentLevel.targetX, posY - currentLevel.targetY));

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full h-full select-none touch-none bg-slate-900 overflow-hidden"
    >
      {/* Top Bar for Parking Mission */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <span className="font-['Jua'] text-lg text-white flex items-center gap-2">
            🅿️ {currentLevel.name}
          </span>
          <span className="text-xs text-amber-300 font-bold bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 rounded-full tabular-nums">
            목표까지 {distToGoal}m
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGoToInteractive}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-slate-200 font-['Jua'] text-xs transition-colors"
          >
            🕹️ 작동 놀이
          </button>
          <button
            onClick={handleResetLevel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-slate-200 font-['Jua'] text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>원위치</span>
          </button>
        </div>
      </div>

      {/* Main Parking Map Viewport */}
      <div className="relative flex-1 flex items-center justify-center p-3">
        <div className="relative w-full max-w-4xl aspect-[8/5] max-h-[66vh] bg-slate-800 rounded-3xl shadow-2xl border-4 border-slate-700 overflow-hidden flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Ground Texture / Asphalt Grid */}
            <rect x="0" y="0" width="800" height="500" fill="#1E293B" />
            {/* Road paving stripes */}
            <g opacity="0.12">
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="#FFFFFF" strokeWidth="1" />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={i} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#FFFFFF" strokeWidth="1" />
              ))}
            </g>

            {/* Tire Tracks / Trail */}
            {trail.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="#0F172A"
                opacity={(i / trail.length) * 0.45}
              />
            ))}

            {/* Parking Target Zone (Glowing yellow/white stripes) */}
            <g transform={`translate(${currentLevel.targetX - currentLevel.targetWidth / 2}, ${currentLevel.targetY - currentLevel.targetHeight / 2})`}>
              {/* Outer parking stall outline */}
              <rect
                width={currentLevel.targetWidth}
                height={currentLevel.targetHeight}
                rx={14}
                fill="rgba(245, 158, 11, 0.15)"
                stroke="#F59E0B"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-pulse"
              />
              {/* Corner markings */}
              <path d="M 0 20 L 0 0 L 20 0" stroke="#FACC15" strokeWidth="6" fill="none" />
              <path d={`M ${currentLevel.targetWidth} 20 L ${currentLevel.targetWidth} 0 L ${currentLevel.targetWidth - 20} 0`} stroke="#FACC15" strokeWidth="6" fill="none" />
              <path d={`M 0 ${currentLevel.targetHeight - 20} L 0 ${currentLevel.targetHeight} L 20 ${currentLevel.targetHeight}`} stroke="#FACC15" strokeWidth="6" fill="none" />
              <path d={`M ${currentLevel.targetWidth} ${currentLevel.targetHeight - 20} L ${currentLevel.targetWidth} ${currentLevel.targetHeight} L ${currentLevel.targetWidth - 20} ${currentLevel.targetHeight}`} stroke="#FACC15" strokeWidth="6" fill="none" />

              {/* Big P Badge in Center */}
              <circle cx={currentLevel.targetWidth / 2} cy={currentLevel.targetHeight / 2} r={24} fill="#2563EB" stroke="#FFFFFF" strokeWidth="3" />
              <text
                x={currentLevel.targetWidth / 2}
                y={currentLevel.targetHeight / 2 + 9}
                fill="#FFFFFF"
                fontSize="26"
                fontWeight="900"
                textAnchor="middle"
              >
                P
              </text>
              <text
                x={currentLevel.targetWidth / 2}
                y={currentLevel.targetHeight + 20}
                fill="#FDE047"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                여기에 주차하세요!
              </text>
            </g>

            {/* Obstacles (Cones, Barriers, Rocks) */}
            {currentLevel.obstacles.map((obs) => {
              if (obs.type === 'cone') {
                return (
                  <g key={obs.id} transform={`translate(${obs.x}, ${obs.y})`}>
                    <rect x="2" y="32" width="40" height="10" rx="3" fill="#1E293B" />
                    <polygon points="22,4 6,34 38,34" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
                    <polygon points="22,14 13,30 31,30" fill="#FFFFFF" opacity="0.8" />
                  </g>
                );
              }
              if (obs.type === 'barrier') {
                return (
                  <g key={obs.id} transform={`translate(${obs.x}, ${obs.y})`}>
                    <rect width={obs.width} height={obs.height} rx={6} fill="#FACC15" stroke="#1E293B" strokeWidth="3" />
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <path
                        key={idx}
                        d={`M ${idx * 20} 0 L ${idx * 20 + 12} ${obs.height}`}
                        stroke="#1E293B"
                        strokeWidth="5"
                      />
                    ))}
                  </g>
                );
              }
              if (obs.type === 'rock') {
                return (
                  <g key={obs.id} transform={`translate(${obs.x}, ${obs.y})`}>
                    <path
                      d={`M 5 ${obs.height - 5} Q ${obs.width * 0.3} 5 ${obs.width * 0.7} 10 Q ${obs.width - 5} ${obs.height * 0.4} ${obs.width - 5} ${obs.height - 5} Z`}
                      fill="#64748B"
                      stroke="#334155"
                      strokeWidth="3"
                    />
                  </g>
                );
              }
              return null;
            })}

            {/* Guide Dotted Vector Arrow towards target */}
            <line
              x1={posX}
              y1={posY}
              x2={currentLevel.targetX}
              y2={currentLevel.targetY}
              stroke="#FACC15"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.3"
            />

            {/* The Controlled Vehicle (Top-down representation) */}
            <g
              transform={`translate(${posX}, ${posY}) rotate(${angle})`}
              onPointerDown={handlePointerDownVehicle}
              onPointerMove={handlePointerMoveVehicle}
              onPointerUp={handlePointerUpVehicle}
              className="cursor-grab active:cursor-grabbing"
            >
              {/* Drop Shadow */}
              <ellipse cx="0" cy="5" rx="46" ry="26" fill="rgba(0,0,0,0.4)" />

              {/* Top Down Vehicle Body based on type */}
              {vehicle.id === 'excavator' && (
                <g>
                  {/* Left & Right Tracks */}
                  <rect x="-35" y="-28" width="70" height="14" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
                  <rect x="-35" y="14" width="70" height="14" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
                  {/* Main Rotating Body */}
                  <rect x="-24" y="-18" width="48" height="36" rx="8" fill="#EAB308" stroke="#0F172A" strokeWidth="2" />
                  {/* Cabin */}
                  <rect x="-5" y="-14" width="22" height="16" rx="3" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
                  {/* Long Boom & Bucket sticking forward */}
                  <rect x="18" y="-4" width="38" height="8" rx="3" fill="#CA8A04" stroke="#0F172A" strokeWidth="1.5" />
                  <polygon points="54,-8 68,-3 68,3 54,8" fill="#334155" stroke="#F59E0B" strokeWidth="1.5" />
                </g>
              )}

              {vehicle.id === 'dumptruck' && (
                <g>
                  {/* Truck Frame & Dump Bed */}
                  <rect x="-42" y="-24" width="55" height="48" rx="6" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
                  {/* Front Cab */}
                  <path d="M 13 -22 L 35 -16 L 35 16 L 13 22 Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2" />
                  {/* Windshield */}
                  <rect x="18" y="-14" width="10" height="28" rx="2" fill="#38BDF8" />
                  {/* Wheels */}
                  <rect x="16" y="-28" width="16" height="6" rx="2" fill="#0F172A" />
                  <rect x="16" y="22" width="16" height="6" rx="2" fill="#0F172A" />
                  <rect x="-34" y="-28" width="22" height="6" rx="2" fill="#0F172A" />
                  <rect x="-34" y="22" width="22" height="6" rx="2" fill="#0F172A" />
                </g>
              )}

              {vehicle.id === 'bulldozer' && (
                <g>
                  {/* Tracks */}
                  <rect x="-32" y="-26" width="64" height="12" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
                  <rect x="-32" y="14" width="64" height="12" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2" />
                  {/* Engine Hood & ROPS */}
                  <rect x="-24" y="-16" width="48" height="32" rx="6" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
                  {/* Giant Front Blade */}
                  <rect x="28" y="-28" width="8" height="56" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="2" />
                  {/* Rear Ripper */}
                  <rect x="-36" y="-10" width="8" height="20" rx="2" fill="#334155" />
                </g>
              )}

              {vehicle.id === 'police' && (
                <g>
                  {/* Police Cruiser Sedan */}
                  <rect x="-36" y="-20" width="72" height="40" rx="14" fill="#1E3A8A" stroke="#0F172A" strokeWidth="2" />
                  {/* White roof & doors */}
                  <rect x="-14" y="-18" width="30" height="36" rx="4" fill="#F8FAFC" />
                  {/* Windshields */}
                  <path d="M 16 -14 L 24 -10 L 24 10 L 16 14 Z" fill="#38BDF8" />
                  {/* Red / Blue Lightbar on roof */}
                  <rect x="-4" y="-14" width="8" height="12" rx="2" fill="#EF4444" className="animate-pulse" />
                  <rect x="-4" y="2" width="8" height="12" rx="2" fill="#3B82F6" className="animate-pulse" />
                  {/* Headlights beam */}
                  <polygon points="36,-12 90,-24 90,24 36,12" fill="rgba(254, 240, 138, 0.25)" />
                </g>
              )}

              {vehicle.id === 'fireengine' && (
                <g>
                  {/* Fire Truck Body */}
                  <rect x="-44" y="-22" width="88" height="44" rx="8" fill="#DC2626" stroke="#0F172A" strokeWidth="2" />
                  {/* Front cab */}
                  <rect x="20" y="-18" width="20" height="36" rx="4" fill="#B91C1C" />
                  <rect x="26" y="-14" width="8" height="28" rx="2" fill="#38BDF8" />
                  {/* Silver Ladder along top */}
                  <rect x="-38" y="-6" width="56" height="12" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
                  {/* Emergency flashers */}
                  <circle cx="36" cy="-14" r="3" fill="#EF4444" className="animate-ping" />
                  <circle cx="36" cy="14" r="3" fill="#3B82F6" className="animate-ping" />
                </g>
              )}
            </g>
          </svg>

          {/* Victory Modal */}
          {isParked && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center mb-3 shadow-lg animate-bounce">
                  <Award className="w-10 h-10 text-slate-900" />
                </div>
                <h3 className="font-['Jua'] text-2xl text-white mb-2">
                  🎉 주차 대성공! 참 잘했어요!
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  {vehicle.koreanName}를 지정된 주차 구역에 쏙 넣었어요!
                </p>

                {/* Star rating */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map((s) => (
                    <Sparkles
                      key={s}
                      className={`w-9 h-9 ${
                        s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleResetLevel}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-['Jua'] text-sm rounded-2xl border border-slate-700 transition-colors"
                  >
                    다시 주차하기
                  </button>
                  <button
                    onClick={handleNextLevelOrVehicle}
                    className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-['Jua'] text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>다음 도전!</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Driving Controls (Generous touch pads for toddlers & children) */}
      <div className="w-full bg-slate-950/90 border-t border-slate-800 p-3 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {/* Steering Left / Right */}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={() => setHeldKeys((k) => ({ ...k, arrowleft: true }))}
              onPointerUp={() => setHeldKeys((k) => ({ ...k, arrowleft: false }))}
              onPointerCancel={() => setHeldKeys((k) => ({ ...k, arrowleft: false }))}
              className="w-16 h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-white flex flex-col items-center justify-center shadow-md border border-slate-700 font-['Jua'] text-xs transition-colors"
            >
              <ArrowLeft className="w-7 h-7" />
              <span>좌회전</span>
            </button>
            <button
              onPointerDown={() => setHeldKeys((k) => ({ ...k, arrowright: true }))}
              onPointerUp={() => setHeldKeys((k) => ({ ...k, arrowright: false }))}
              onPointerCancel={() => setHeldKeys((k) => ({ ...k, arrowright: false }))}
              className="w-16 h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-white flex flex-col items-center justify-center shadow-md border border-slate-700 font-['Jua'] text-xs transition-colors"
            >
              <ArrowRight className="w-7 h-7" />
              <span>우회전</span>
            </button>
          </div>

          <div className="text-center hidden sm:block">
            <span className="text-[11px] text-slate-400 font-['Jua']">
              화면의 차를 손가락으로 직접 끌어도 이동해요!
            </span>
          </div>

          {/* Throttle Forward / Reverse */}
          <div className="flex items-center gap-2">
            <button
              onPointerDown={() => setHeldKeys((k) => ({ ...k, arrowdown: true }))}
              onPointerUp={() => setHeldKeys((k) => ({ ...k, arrowdown: false }))}
              onPointerCancel={() => setHeldKeys((k) => ({ ...k, arrowdown: false }))}
              className="w-16 h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-red-500 active:text-white text-white flex flex-col items-center justify-center shadow-md border border-slate-700 font-['Jua'] text-xs transition-colors"
            >
              <ArrowDown className="w-7 h-7" />
              <span>후진</span>
            </button>
            <button
              onPointerDown={() => setHeldKeys((k) => ({ ...k, arrowup: true }))}
              onPointerUp={() => setHeldKeys((k) => ({ ...k, arrowup: false }))}
              onPointerCancel={() => setHeldKeys((k) => ({ ...k, arrowup: false }))}
              className="w-16 h-16 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 flex flex-col items-center justify-center shadow-lg font-['Jua'] text-xs transition-all"
            >
              <ArrowUp className="w-8 h-8 font-black" />
              <span>전진!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

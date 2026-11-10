import React, { useState, useEffect, useRef } from 'react';
import { VehicleDefinition } from '../types/vehicle';
import { VehiclePartSvg } from './VehiclePartSvg';
import { sound } from '../services/sound';
import { Volume2, Play, RotateCw, ArrowUpRight, Flame, Sparkles, Droplets, MoveRight, HelpCircle } from 'lucide-react';

interface Props {
  vehicle: VehicleDefinition;
  onGoToParking: () => void;
  onGoToAssemble: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export const InteractiveRig: React.FC<Props> = ({
  vehicle,
  onGoToParking,
  onGoToAssemble,
}) => {
  // Mechanical animation states
  const [boomAngle, setBoomAngle] = useState<number>(0);
  const [armAngle, setArmAngle] = useState<number>(0);
  const [bucketAngle, setBucketAngle] = useState<number>(0);
  const [dumpAngle, setDumpAngle] = useState<number>(0);
  const [bladeLift, setBladeLift] = useState<number>(0);
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [ladderAngle, setLadderAngle] = useState<number>(0);
  const [ladderExtend, setLadderExtend] = useState<number>(0);
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(false);

  // Playground simulation states
  const [dirtPileHeight, setDirtPileHeight] = useState<number>(80);
  const [hasBucketDirt, setHasBucketDirt] = useState<boolean>(false);
  const [hasDumpGravel, setHasDumpGravel] = useState<boolean>(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [smokePuffs, setSmokePuffs] = useState<{ id: number; x: number; y: number }[]>([]);
  const [fireExtinguished, setFireExtinguished] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string>('원하는 부품이나 버튼을 콕 터치해보세요!');

  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    sound.speak(`${vehicle.koreanName}의 부품이나 버튼을 터치해서 움직여보세요!`);
    setActionNotice(`${vehicle.koreanName}의 부품이나 아래 버튼을 터치해보세요!`);
  }, [vehicle.id]);

  // Particle physics loop for falling dirt, gravel, water
  useEffect(() => {
    const loop = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.35, // Gravity
            alpha: p.alpha - 0.015,
          }))
          .filter((p) => p.y < 460 && p.alpha > 0.05)
      );
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Spawn smoke puffs
  const triggerSmoke = (x: number, y: number) => {
    const newPuff = { id: Date.now(), x, y };
    setSmokePuffs((prev) => [...prev, newPuff]);
    setTimeout(() => {
      setSmokePuffs((prev) => prev.filter((p) => p.id !== newPuff.id));
    }, 1200);
  };

  // 1. Excavator: Dig Dirt Sequence
  const handleExcavatorDig = () => {
    setActionNotice('버킷이 땅을 파고 흙을 푹 퍼 올려요!');
    sound.playHydraulic();
    sound.speak('흙을 푹 퍼 올려요!');

    // Step 1: Lower boom & reach arm
    setBoomAngle(18);
    setArmAngle(-25);
    setBucketAngle(-30);

    setTimeout(() => {
      // Step 2: Bucket scoops into ground
      setBucketAngle(40);
      sound.playHydraulic();
      setHasBucketDirt(true);
      setDirtPileHeight((h) => Math.max(h - 15, 20));

      // Dig dust particles
      const newParts: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
        id: Date.now() + i,
        x: 620 + Math.random() * 30,
        y: 380,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 2,
        size: Math.random() * 8 + 4,
        color: '#78350F',
        alpha: 1,
      }));
      setParticles((p) => [...p, ...newParts]);

      setTimeout(() => {
        // Step 3: Lift boom high with dirt
        setBoomAngle(-22);
        setArmAngle(10);
        sound.playHydraulic();
      }, 700);
    }, 700);
  };

  // 2. Excavator: Dump Dirt Sequence
  const handleExcavatorDump = () => {
    if (!hasBucketDirt) {
      setActionNotice('먼저 흙 퍼올리기 버튼을 눌러보세요!');
      sound.speak('버킷에 흙을 먼저 담아보세요!');
      return;
    }
    setActionNotice('버킷을 기울여 흙을 와르르 쏟아내요!');
    sound.playHydraulic();
    setBucketAngle(-55);

    setTimeout(() => {
      sound.playDumpSound();
      sound.speak('흙이 와르르 쏟아져요!');
      setHasBucketDirt(false);
      setDirtPileHeight((h) => Math.min(h + 20, 100));

      // Soil dropping particles
      const newParts: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
        id: Date.now() + i,
        x: 620 + (Math.random() - 0.5) * 40,
        y: 280,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 9 + 4,
        color: Math.random() > 0.5 ? '#78350F' : '#92400E',
        alpha: 1,
      }));
      setParticles((p) => [...p, ...newParts]);

      setTimeout(() => {
        // Return to neutral
        setBucketAngle(0);
        setBoomAngle(0);
        setArmAngle(0);
      }, 900);
    }, 400);
  };

  // 3. Dump Truck: Lift Bed & Pour Gravel
  const handleDumpBed = () => {
    setActionNotice('유압 피스톤이 적재함을 높이 들어요!');
    sound.playHydraulic();
    sound.speak('적재함을 번쩍 들어요!');
    setDumpAngle(38);

    setTimeout(() => {
      if (hasDumpGravel) {
        sound.playDumpSound();
        sound.speak('돌멩이와 흙이 와르르!');
        setHasDumpGravel(false);

        // Gravel tumbling particles
        const newParts: Particle[] = Array.from({ length: 40 }).map((_, i) => ({
          id: Date.now() + i,
          x: 180 + (Math.random() - 0.5) * 50,
          y: 280,
          vx: -Math.random() * 5 - 2,
          vy: Math.random() * 2 + 1,
          size: Math.random() * 12 + 6,
          color: Math.random() > 0.4 ? '#64748B' : '#78350F',
          alpha: 1,
        }));
        setParticles((p) => [...p, ...newParts]);
      }

      setTimeout(() => {
        setDumpAngle(0);
        sound.playHydraulic();
      }, 1500);
    }, 600);
  };

  const handleReloadGravel = () => {
    setActionNotice('덤프트럭에 흙과 돌멩이를 다시 가득 채웠어요!');
    sound.playDumpSound();
    sound.speak('자갈을 다시 가득 채웠어요!');
    setHasDumpGravel(true);
  };

  // 4. Bulldozer: Push Soil
  const handleDozerPush = () => {
    setActionNotice('불도저가 전진하며 흙을 시원하게 밀어내요!');
    sound.playEngineRev();
    sound.speak('힘차게 흙을 밀어요!');
    setBladeLift(-12);

    // Dust particles
    const newParts: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      x: 640 + Math.random() * 40,
      y: 410,
      vx: Math.random() * 5 + 3,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 10 + 5,
      color: '#B45309',
      alpha: 1,
    }));
    setParticles((p) => [...p, ...newParts]);

    setTimeout(() => {
      setBladeLift(0);
    }, 1200);
  };

  // 5. Police Car: Siren & Flash
  const handlePoliceSiren = () => {
    const next = !sirenActive;
    setSirenActive(next);
    if (next) {
      setActionNotice('삐뽀삐뽀! 긴급 출동 사이렌이 울려요!');
      sound.playSiren(3.5);
      sound.speak('삐뽀삐뽀! 긴급 출동!');
      setTimeout(() => setSirenActive(false), 3500);
    }
  };

  // 6. Fire Engine: Spray Water
  const handleFireSpray = () => {
    setActionNotice('고압 물대포가 시원하게 물을 뿜어요!');
    sound.playWaterSpray();
    sound.speak('물대포 촤아악 발사!');
    setFireExtinguished(true);

    // Water stream particles
    const newParts: Particle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: Date.now() + i,
      x: 530,
      y: 135,
      vx: Math.random() * 8 + 6,
      vy: (Math.random() - 0.5) * 4 - 1,
      size: Math.random() * 7 + 3,
      color: '#38BDF8',
      alpha: 1,
    }));
    setParticles((p) => [...p, ...newParts]);

    setTimeout(() => {
      setFireExtinguished(false);
    }, 3000);
  };

  // 7. Fire Engine: Raise Ladder
  const handleLadderLift = () => {
    const nextAngle = ladderAngle === 0 ? 35 : 0;
    const nextExtend = ladderExtend === 0 ? 60 : 0;
    setLadderAngle(nextAngle);
    setLadderExtend(nextExtend);
    sound.playHydraulic();
    sound.speak(nextAngle > 0 ? '사다리가 하늘 높이 올라가요!' : '사다리를 안전하게 접어요.');
  };

  // Universal Horn
  const handleHorn = () => {
    sound.playHorn(vehicle.category === '중장비' ? 'heavy' : 'car');
    setActionNotice('빵빵! 경적을 울렸어요!');
    triggerSmoke(260, 160);
  };

  // Universal Engine Rev
  const handleEngineRev = () => {
    sound.playEngineRev();
    setActionNotice('부르릉~ 힘찬 엔진 소리가 울려 퍼져요!');
    triggerSmoke(250, 170);
  };

  return (
    <div className="relative flex flex-col w-full h-full select-none bg-gradient-to-b from-sky-100 via-amber-50 to-amber-200 overflow-hidden">
      {/* Top Banner Notice */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/85 border-b border-amber-300 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <span className="font-['Jua'] text-lg text-slate-800 flex items-center gap-2">
            ✨ {vehicle.koreanName} 직접 조작하기
          </span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
            원인과 결과 놀이
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGoToAssemble}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-['Jua'] text-xs transition-colors shadow-sm"
          >
            🧩 다시 조립
          </button>
          <button
            onClick={onGoToParking}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-['Jua'] text-xs shadow-md transition-all active:scale-95"
          >
            🚗 주차 미션 출발!
          </button>
        </div>
      </div>

      {/* Dynamic Action Toast for Toddlers */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-white/95 border-2 border-amber-400 shadow-lg px-4 py-2 rounded-2xl flex items-center gap-2.5 max-w-md w-[92%]">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 animate-spin" />
        <p className="font-['Jua'] text-slate-800 text-xs sm:text-sm truncate">
          {actionNotice}
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative flex-1 flex items-center justify-center p-3">
        <div className="relative w-full max-w-4xl aspect-[8/5] max-h-[66vh] bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex items-center justify-center">
          {/* Construction / City Background Scene */}
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Sky clouds */}
            <g opacity="0.6">
              <ellipse cx="140" cy="80" rx="55" ry="22" fill="#FFFFFF" />
              <ellipse cx="175" cy="70" rx="40" ry="26" fill="#FFFFFF" />
              <ellipse cx="640" cy="90" rx="65" ry="25" fill="#FFFFFF" />
              <ellipse cx="680" cy="80" rx="45" ry="30" fill="#FFFFFF" />
            </g>

            {/* Distant construction hills or cityscape */}
            {vehicle.category === '중장비' ? (
              <path
                d="M 0 380 Q 200 320 400 370 T 800 360 L 800 500 L 0 500 Z"
                fill="#FDE68A"
                opacity="0.7"
              />
            ) : (
              <g opacity="0.5">
                <rect x="80" y="240" width="70" height="150" fill="#CBD5E1" />
                <rect x="180" y="200" width="90" height="190" fill="#94A3B8" />
                <rect x="620" y="220" width="80" height="170" fill="#CBD5E1" />
              </g>
            )}

            {/* Construction Dirt Mound / Sandbox on the right */}
            {vehicle.id === 'excavator' && (
              <g>
                <path
                  d={`M 560 440 Q 640 ${440 - dirtPileHeight} 720 440 Z`}
                  fill="#78350F"
                  stroke="#451A03"
                  strokeWidth="3"
                />
                <text x="640" y="430" fill="#FEF3C7" fontSize="13" fontWeight="bold" textAnchor="middle">
                  모래 흙더미
                </text>
              </g>
            )}

            {/* Boulder for Bulldozer */}
            {vehicle.id === 'bulldozer' && (
              <g transform="translate(620, 370)">
                <path d="M 0 50 Q 25 10 60 20 Q 90 30 85 70 Q 50 80 0 70 Z" fill="#64748B" stroke="#334155" strokeWidth="3" />
                <circle cx="35" cy="45" r="4" fill="#94A3B8" />
              </g>
            )}

            {/* Fire flame target for Fire Engine */}
            {vehicle.id === 'fireengine' && !fireExtinguished && (
              <g transform="translate(660, 360)" className="animate-bounce">
                <circle cx="30" cy="30" r="28" fill="rgba(239, 68, 68, 0.2)" />
                <path d="M 30 0 Q 45 25 35 45 Q 15 25 30 0 Z" fill="#EF4444" />
                <path d="M 30 15 Q 40 30 32 45 Q 20 30 30 15 Z" fill="#FACC15" />
              </g>
            )}
            {vehicle.id === 'fireengine' && fireExtinguished && (
              <g transform="translate(650, 360)">
                <text x="30" y="30" fill="#0284C7" fontSize="22" fontWeight="bold" textAnchor="middle">
                  💦 진화 완료!
                </text>
              </g>
            )}

            {/* Ground line */}
            <rect x="0" y="430" width="800" height="70" fill="#E2E8F0" />
            <line x1="0" y1="430" x2="800" y2="430" stroke="#CBD5E1" strokeWidth="4" />

            {/* Assembled Vehicle Layers with Interactive Rig parameters */}
            {vehicle.pieces
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((piece) => (
                <g
                  key={piece.id}
                  onClick={() => {
                    // Direct touch hotspot triggers
                    if (piece.svgPath.includes('bucket')) handleExcavatorDig();
                    else if (piece.svgPath.includes('boom') || piece.svgPath.includes('arm')) handleExcavatorDump();
                    else if (piece.svgPath.includes('bed')) handleDumpBed();
                    else if (piece.svgPath.includes('blade')) handleDozerPush();
                    else if (piece.svgPath.includes('lightbar') || piece.svgPath.includes('siren')) handlePoliceSiren();
                    else if (piece.svgPath.includes('water')) handleFireSpray();
                    else if (piece.svgPath.includes('cabin')) handleHorn();
                    else handleEngineRev();
                  }}
                  className="cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <VehiclePartSvg
                    piece={piece}
                    isGhost={false}
                    isCompleted={true}
                    interactiveState={{
                      boomAngle,
                      armAngle,
                      bucketAngle,
                      dumpAngle,
                      bladeLift,
                      sirenActive,
                      ladderAngle,
                      ladderExtend,
                      headlightsOn,
                    }}
                  />
                </g>
              ))}

            {/* Dirt inside excavator bucket if scooped */}
            {hasBucketDirt && (
              <g transform={`rotate(${bucketAngle}, 605, 315)`}>
                <circle cx="625" cy="335" r="16" fill="#78350F" />
              </g>
            )}

            {/* Dynamic Falling Particles (Dirt, Gravel, Water) */}
            {particles.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={p.size}
                fill={p.color}
                opacity={p.alpha}
              />
            ))}

            {/* Exhaust Smoke Puffs */}
            {smokePuffs.map((puff) => (
              <g key={puff.id} className="animate-ping" opacity="0.7">
                <circle cx={puff.x} cy={puff.y - 15} r="14" fill="#E2E8F0" />
                <circle cx={puff.x + 10} cy={puff.y - 30} r="18" fill="#F1F5F9" />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Bottom Cause-and-Effect Tactile Action Dashboard */}
      <div className="w-full bg-white/95 border-t-2 border-amber-300 p-2.5 sm:p-3 z-20">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="font-['Jua'] text-xs sm:text-sm text-slate-800 flex items-center gap-2">
            🕹️ {vehicle.koreanName} 조작 레버
          </span>
          <span className="text-[11px] text-slate-500 font-bold">
            버튼을 누르면 신기한 일이 벌어져요!
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 px-1">
          {/* Vehicle Specific Actions */}
          {vehicle.id === 'excavator' && (
            <>
              <button
                onClick={handleExcavatorDig}
                className="flex items-center gap-2 p-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-2xl shadow-sm text-slate-900 font-['Jua'] text-xs sm:text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <span>흙 퍼올리기</span>
              </button>

              <button
                onClick={handleExcavatorDump}
                className="flex items-center gap-2 p-2.5 bg-amber-100 hover:bg-amber-200 active:scale-95 rounded-2xl shadow-sm text-slate-900 font-['Jua'] text-xs sm:text-sm transition-all border border-amber-300"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span>흙 쏟아내기</span>
              </button>
            </>
          )}

          {vehicle.id === 'dumptruck' && (
            <>
              <button
                onClick={handleDumpBed}
                className="flex items-center gap-2 p-2.5 bg-orange-400 hover:bg-orange-500 active:scale-95 rounded-2xl shadow-sm text-slate-950 font-['Jua'] text-xs sm:text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-orange-700 text-white flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span>적재함 들기!</span>
              </button>

              <button
                onClick={handleReloadGravel}
                className="flex items-center gap-2 p-2.5 bg-orange-100 hover:bg-orange-200 active:scale-95 rounded-2xl shadow-sm text-slate-900 font-['Jua'] text-xs sm:text-sm transition-all border border-orange-300"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>자갈 다시 싣기</span>
              </button>
            </>
          )}

          {vehicle.id === 'bulldozer' && (
            <>
              <button
                onClick={handleDozerPush}
                className="flex items-center gap-2 p-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 rounded-2xl shadow-sm text-slate-950 font-['Jua'] text-xs sm:text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0">
                  <MoveRight className="w-4 h-4" />
                </div>
                <span>흙더미 밀기</span>
              </button>
            </>
          )}

          {vehicle.id === 'police' && (
            <>
              <button
                onClick={handlePoliceSiren}
                className={`flex items-center gap-2 p-2.5 rounded-2xl shadow-sm font-['Jua'] text-xs sm:text-sm transition-all ${
                  sirenActive
                    ? 'bg-red-500 text-white ring-2 ring-red-400 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>{sirenActive ? '사이렌 울리는 중!' : '사이렌 켜기'}</span>
              </button>

              <button
                onClick={() => {
                  setHeadlightsOn(!headlightsOn);
                  sound.playPickup();
                }}
                className="flex items-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-2xl shadow-sm text-slate-800 font-['Jua'] text-xs sm:text-sm transition-all border border-slate-300"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>서치라이트</span>
              </button>
            </>
          )}

          {vehicle.id === 'fireengine' && (
            <>
              <button
                onClick={handleFireSpray}
                className="flex items-center gap-2 p-2.5 bg-blue-500 hover:bg-blue-600 active:scale-95 rounded-2xl shadow-sm text-white font-['Jua'] text-xs sm:text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <span>물대포 발사!</span>
              </button>

              <button
                onClick={handleLadderLift}
                className="flex items-center gap-2 p-2.5 bg-red-100 hover:bg-red-200 active:scale-95 rounded-2xl shadow-sm text-slate-900 font-['Jua'] text-xs sm:text-sm transition-all border border-red-300"
              >
                <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span>사다리 올리기</span>
              </button>
            </>
          )}

          {/* Universal Horn */}
          <button
            onClick={handleHorn}
            className="flex items-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-2xl shadow-sm text-slate-800 font-['Jua'] text-xs sm:text-sm transition-all border border-slate-200"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <span>빵빵! 경적</span>
          </button>

          {/* Universal Engine Rev */}
          <button
            onClick={handleEngineRev}
            className="flex items-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-2xl shadow-sm text-slate-800 font-['Jua'] text-xs sm:text-sm transition-all border border-slate-200"
          >
            <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <span>엔진 가속</span>
          </button>
        </div>
      </div>
    </div>
  );
};

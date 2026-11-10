import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { VehicleDefinition, PuzzlePiece } from '../types/vehicle';
import { VehiclePartSvg } from './VehiclePartSvg';
import { sound } from '../services/sound';
import { Sparkles, HelpCircle, RotateCcw, Play, Compass } from 'lucide-react';

interface Props {
  vehicle: VehicleDefinition;
  onComplete: () => void;
  onGoToInteractive: () => void;
  onGoToParking: () => void;
}

export const PuzzleBoard: React.FC<Props> = ({
  vehicle,
  onComplete,
  onGoToInteractive,
  onGoToParking,
}) => {
  const [placedPieceIds, setPlacedPieceIds] = useState<string[]>([]);
  const [activeDraggingPiece, setActiveDraggingPiece] = useState<PuzzlePiece | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastPlacedInfo, setLastPlacedInfo] = useState<{ name: string; desc: string } | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Reset state when vehicle changes
  useEffect(() => {
    setPlacedPieceIds([]);
    setActiveDraggingPiece(null);
    setSelectedPieceId(null);
    setLastPlacedInfo(null);
    setIsFinished(false);
    sound.speak(`${vehicle.koreanName} 조립을 시작해볼까요? 부품을 끌어다 맞춰보세요!`);
  }, [vehicle.id]);

  const unplacedPieces = vehicle.pieces.filter((p) => !placedPieceIds.includes(p.id));

  // Check victory
  const checkCompletion = (newPlaced: string[]) => {
    if (newPlaced.length === vehicle.pieces.length && !isFinished) {
      setIsFinished(true);
      onComplete();
      sound.playVictoryFanfare();
      setTimeout(() => sound.playHorn('heavy'), 800);
      sound.speak(`만세! 멋진 ${vehicle.koreanName}가 완성되었어요!`);

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
        });
      }, 350);
    }
  };

  const handlePointerDown = (piece: PuzzlePiece, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDraggingPiece(piece);
    setSelectedPieceId(piece.id);
    sound.playPickup();

    const rect = boardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDraggingPiece || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerUp = () => {
    if (!activeDraggingPiece || !boardRef.current || !svgRef.current) {
      setActiveDraggingPiece(null);
      return;
    }

    // Convert mouse/touch position to SVG coordinates (0 0 800 500)
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = 800 / svgRect.width;
    const scaleY = 500 / svgRect.height;

    const boardRect = boardRef.current.getBoundingClientRect();
    const currentSvgX = (dragPos.x - (svgRect.left - boardRect.left)) * scaleX;
    const currentSvgY = (dragPos.y - (svgRect.top - boardRect.top)) * scaleY;

    // Target center coordinates in SVG space
    const targetCenterX = activeDraggingPiece.x + activeDraggingPiece.width / 2;
    const targetCenterY = activeDraggingPiece.y + activeDraggingPiece.height / 2;

    const distance = Math.hypot(currentSvgX - targetCenterX, currentSvgY - targetCenterY);

    // Generous snap distance (85 SVG units)
    if (distance < 95) {
      // Snap success!
      const nextPlaced = [...placedPieceIds, activeDraggingPiece.id];
      setPlacedPieceIds(nextPlaced);
      sound.playSnap();
      sound.speak(activeDraggingPiece.name);
      setLastPlacedInfo({
        name: activeDraggingPiece.name,
        desc: activeDraggingPiece.description,
      });
      checkCompletion(nextPlaced);
    }

    setActiveDraggingPiece(null);
  };

  const handleReset = () => {
    setPlacedPieceIds([]);
    setIsFinished(false);
    setSelectedPieceId(null);
    setLastPlacedInfo(null);
    sound.speak('처음부터 다시 맞춰볼까요?');
  };

  // Auto snap single piece on click (helpful for younger toddlers)
  const handleTapToPlace = (piece: PuzzlePiece) => {
    setSelectedPieceId(piece.id);
    sound.playPickup();
    setLastPlacedInfo({
      name: piece.name,
      desc: piece.description,
    });
    sound.speak(`${piece.name}: ${piece.description}`);
  };

  const handleDoubleTapAutoPlace = (piece: PuzzlePiece) => {
    const nextPlaced = [...placedPieceIds, piece.id];
    setPlacedPieceIds(nextPlaced);
    sound.playSnap();
    setLastPlacedInfo({
      name: piece.name,
      desc: piece.description,
    });
    checkCompletion(nextPlaced);
  };

  return (
    <div
      ref={boardRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex flex-col w-full h-full select-none touch-none bg-gradient-to-b from-amber-50 via-slate-50 to-amber-100 overflow-hidden"
    >
      {/* Top Puzzle Status & Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/80 border-b border-amber-200 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <span className="font-['Jua'] text-lg text-slate-800 flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: vehicle.primaryColor }}
            />
            {vehicle.koreanName} 조립하기
          </span>
          <span className="text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full tabular-nums">
            {placedPieceIds.length} / {vehicle.pieces.length} 조각
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hint Toggle */}
          <button
            onClick={() => {
              setShowHint(!showHint);
              sound.playPickup();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shadow-sm ${
              showHint
                ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-500'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>{showHint ? '힌트 켜짐' : '힌트 보기'}</span>
          </button>

          {/* Reset Board */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>다시 맞추기</span>
          </button>
        </div>
      </div>

      {/* Educational Banner when piece is placed/touched */}
      {lastPlacedInfo && !isFinished && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[90%] bg-white/95 border-2 border-amber-300 shadow-lg rounded-2xl p-2.5 flex items-center gap-3 animate-bounce">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-['Jua'] text-sm text-slate-900">{lastPlacedInfo.name}</h4>
            <p className="text-xs text-slate-600 truncate">{lastPlacedInfo.desc}</p>
          </div>
        </div>
      )}

      {/* Main Blueprint & Canvas Assembly Workspace */}
      <div className="relative flex-1 flex items-center justify-center p-3">
        {/* Subtle engineering blueprint grid backdrop */}
        <div className="absolute inset-0 opacity-25 pointer-events-none [background-image:radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative w-full max-w-4xl aspect-[8/5] max-h-[65vh] bg-white rounded-3xl shadow-xl border-4 border-amber-200 overflow-hidden flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Construction drop shadow */}
              <filter id="piece-shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.25" />
              </filter>
              {/* Snap target pulse glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ground surface line */}
            <line x1="60" y1="440" x2="740" y2="440" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 12" />

            {/* 1. Silhouettes / Ghost Outlines for all pieces */}
            {vehicle.pieces.map((piece) => {
              const isPlaced = placedPieceIds.includes(piece.id);
              const isSelected = selectedPieceId === piece.id;
              if (isPlaced) return null;

              return (
                <g
                  key={`ghost-${piece.id}`}
                  className="transition-all duration-300"
                  filter={isSelected || showHint ? 'url(#glow)' : undefined}
                >
                  <VehiclePartSvg piece={piece} isGhost={true} />
                  {/* Glowing highlight indicator for selected or hint */}
                  {(isSelected || showHint) && (
                    <rect
                      x={piece.x - 4}
                      y={piece.y - 4}
                      width={piece.width + 8}
                      height={piece.height + 8}
                      rx={piece.width > 200 ? 20 : 12}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      strokeDasharray="8 6"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}

            {/* 2. Successfully Placed Pieces in Layer Order */}
            {vehicle.pieces
              .filter((p) => placedPieceIds.includes(p.id))
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((piece) => (
                <g key={`placed-${piece.id}`} filter="url(#piece-shadow)">
                  <VehiclePartSvg piece={piece} isGhost={false} isCompleted={true} />
                </g>
              ))}
          </svg>

          {/* Victory Modal Overlay when all pieces snapped */}
          {isFinished && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-400 max-w-md w-full flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center mb-3 shadow-md animate-bounce">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-['Jua'] text-2xl text-slate-900 mb-1">
                  와! {vehicle.koreanName} 조립 완성!
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  {vehicle.subTitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={onGoToInteractive}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-['Jua'] text-base rounded-2xl shadow-lg transition-all"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>직접 작동해보기</span>
                  </button>
                  <button
                    onClick={onGoToParking}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-['Jua'] text-base rounded-2xl shadow-lg transition-all"
                  >
                    <Compass className="w-5 h-5" />
                    <span>주차 미션 가기</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Dragging Piece Follower */}
      {activeDraggingPiece && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl transition-transform"
          style={{
            left: `${dragPos.x + (boardRef.current?.getBoundingClientRect().left || 0)}px`,
            top: `${dragPos.y + (boardRef.current?.getBoundingClientRect().top || 0)}px`,
            width: `${Math.max(activeDraggingPiece.width * 0.9, 90)}px`,
            height: `${Math.max(activeDraggingPiece.height * 0.9, 70)}px`,
          }}
        >
          <svg
            viewBox={`${activeDraggingPiece.x} ${activeDraggingPiece.y} ${activeDraggingPiece.width} ${activeDraggingPiece.height}`}
            className="w-full h-full"
          >
            <VehiclePartSvg piece={activeDraggingPiece} isGhost={false} />
          </svg>
        </div>
      )}

      {/* Bottom Part Tray (Dock of unplaced pieces) */}
      <div className="w-full bg-amber-100/90 border-t-2 border-amber-300 p-2 sm:p-3 z-20">
        <div className="flex items-center justify-between mb-1.5 px-2">
          <span className="font-['Jua'] text-xs sm:text-sm text-slate-700 flex items-center gap-1.5">
            <span>🧩 부품 상자</span>
            <span className="text-xs font-normal text-slate-500">(손가락으로 끌어다 맞춰보세요)</span>
          </span>
          <span className="text-xs text-amber-800 font-bold">
            남은 부품 {unplacedPieces.length}개
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1.5 px-1 scrollbar-thin">
          {unplacedPieces.length === 0 ? (
            <div className="w-full py-4 text-center font-['Jua'] text-amber-700 text-sm">
              ✨ 모든 부품을 완벽하게 맞췄어요!
            </div>
          ) : (
            unplacedPieces.map((piece) => {
              const isSelected = selectedPieceId === piece.id;
              return (
                <div
                  key={piece.id}
                  onPointerDown={(e) => handlePointerDown(piece, e)}
                  onClick={() => handleTapToPlace(piece)}
                  onDoubleClick={() => handleDoubleTapAutoPlace(piece)}
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl bg-white border-2 cursor-grab active:cursor-grabbing transition-all shrink-0 hover:shadow-md select-none touch-none ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-md scale-105'
                      : 'border-amber-200 hover:border-amber-400'
                  }`}
                  style={{ width: '110px', height: '100px' }}
                >
                  <div className="w-full h-14 flex items-center justify-center pointer-events-none">
                    <svg
                      viewBox={`${piece.x} ${piece.y} ${piece.width} ${piece.height}`}
                      className="max-w-full max-h-full"
                    >
                      <VehiclePartSvg piece={piece} isGhost={false} />
                    </svg>
                  </div>
                  <span className="font-['Jua'] text-[11px] text-slate-800 text-center truncate w-full px-1">
                    {piece.name}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { GameMode, VehicleDefinition } from '../types/vehicle';
import { sound } from '../services/sound';
import { Volume2, VolumeX, Mic, MicOff, Truck, Download } from 'lucide-react';

interface Props {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  selectedVehicle: VehicleDefinition;
  onOpenVehicleSelector: () => void;
  onOpenDownload: () => void;
}

export const GameHeader: React.FC<Props> = ({
  currentMode,
  onSelectMode,
  selectedVehicle,
  onOpenVehicleSelector,
  onOpenDownload,
}) => {
  const [isMuted, setIsMuted] = React.useState<boolean>(sound.getMuted());
  const [voiceOn, setVoiceOn] = React.useState<boolean>(sound.getVoiceEnabled());

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    sound.setVoiceEnabled(next);
    if (next) {
      sound.speak('음성 안내가 켜졌어요!');
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 py-2.5 bg-amber-400 border-b-2 border-amber-500 shadow-sm shrink-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenVehicleSelector}
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity text-left"
          title="다른 탈것 고르기"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-['Jua'] text-lg text-slate-950 whitespace-nowrap block leading-tight">
              탈것 조립 & 주차
            </span>
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <span>{selectedVehicle.koreanName}</span>
              <span className="underline decoration-amber-700">변경 ▾</span>
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: 3-4 clean single-line mode buttons */}
      <nav className="flex items-center gap-1.5 sm:gap-2 bg-amber-500/50 p-1 rounded-2xl">
        <button
          onClick={() => {
            onSelectMode('assemble');
            sound.playPickup();
          }}
          className={`px-3 py-1.5 rounded-xl font-['Jua'] text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentMode === 'assemble'
              ? 'bg-white text-slate-950 shadow-sm scale-102'
              : 'text-amber-950 hover:bg-amber-400/70'
          }`}
        >
          🧩 조립 퍼즐
        </button>

        <button
          onClick={() => {
            onSelectMode('interactive');
            sound.playPickup();
          }}
          className={`px-3 py-1.5 rounded-xl font-['Jua'] text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentMode === 'interactive'
              ? 'bg-white text-slate-950 shadow-sm scale-102'
              : 'text-amber-950 hover:bg-amber-400/70'
          }`}
        >
          🕹️ 원인·결과 작동
        </button>

        <button
          onClick={() => {
            onSelectMode('parking');
            sound.playPickup();
          }}
          className={`px-3 py-1.5 rounded-xl font-['Jua'] text-xs sm:text-sm whitespace-nowrap transition-all ${
            currentMode === 'parking'
              ? 'bg-white text-slate-950 shadow-sm scale-102'
              : 'text-amber-950 hover:bg-amber-400/70'
          }`}
        >
          🅿️ 주차 미션
        </button>
      </nav>

      {/* Zone 3: Audio, Speech & Download action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-400 font-['Jua'] text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          title="index.html 다운로드"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">index.html 다운</span>
          <span className="sm:hidden">다운</span>
        </button>

        <button
          onClick={toggleVoice}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${
            voiceOn
              ? 'bg-white text-slate-900 border-amber-300 shadow-sm'
              : 'bg-amber-500/60 text-amber-900 border-amber-600/30'
          }`}
          title={voiceOn ? '음성 안내 끄기' : '음성 안내 켜기'}
        >
          {voiceOn ? <Mic className="w-4 h-4 text-emerald-600" /> : <MicOff className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleMute}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors border ${
            !isMuted
              ? 'bg-white text-slate-900 border-amber-300 shadow-sm'
              : 'bg-amber-500/60 text-amber-900 border-amber-600/30'
          }`}
          title={isMuted ? '소리 켜기' : '소리 끄기'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-slate-800" />}
        </button>
      </div>
    </header>
  );
};

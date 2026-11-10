import React, { useState } from 'react';
import { sound } from '../services/sound';
import { Download, X, CheckCircle2, FileCode, Sparkles, MonitorPlay } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = async (type: 'standalone' | 'source') => {
    setDownloadingType(type);
    sound.playPickup();

    try {
      const url = type === 'standalone' ? '/standalone_index.html' : '/source_index.html';
      const response = await fetch(url);
      
      let blob: Blob;
      if (response.ok) {
        blob = await response.blob();
      } else {
        // Fallback: if running in dev environment and file is not yet cached, fetch root index.html
        const fallbackRes = await fetch('/');
        blob = await fallbackRes.blob();
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      sound.playSnap();
      sound.speak('index.html 파일이 다운로드되었어요!');
      setDownloadSuccess(type);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-4 border-amber-400 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 border-b border-amber-500">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Jua'] text-xl text-slate-950 leading-tight">
                index.html 다운로드
              </h3>
              <p className="text-xs font-bold text-amber-900">
                내 컴퓨터나 기기에 파일로 저장하여 실행할 수 있어요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Option 1: Standalone Ready-to-Run Single File (Recommended) */}
          <div className="p-4 rounded-2xl border-2 border-amber-500 bg-amber-50/70 relative">
            <div className="absolute -top-3 right-4 bg-amber-500 text-slate-950 font-['Jua'] text-[11px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>추천 · 바로 실행</span>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                <MonitorPlay className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Jua'] text-base text-slate-900">
                  완전 독립 실행형 index.html (단일 파일)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  인터넷 연결이나 Node.js 설치 없이, 다운로드 후 <strong>더블클릭만 하면 웹 브라우저에서 바로 모든 게임과 소리가 100% 실행</strong>되는 완성형 올인원 파일입니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => triggerDownload('standalone')}
              disabled={downloadingType !== null}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-['Jua'] text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadingType === 'standalone'
                  ? '파일 생성 및 다운로드 중...'
                  : '독립 실행형 index.html 다운로드'}
              </span>
            </button>

            {downloadSuccess === 'standalone' && (
              <p className="text-[11px] text-emerald-700 font-bold mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                다운로드가 완료되었습니다! 브라우저로 열어보세요.
              </p>
            )}
          </div>

          {/* Option 2: Source index.html */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-['Jua'] text-sm text-slate-900">
                  개발용 원본 index.html
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  프로젝트 루트의 원본 index.html 파일(Vite 개발 서버 연결 템플릿)을 다운로드합니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => triggerDownload('source')}
              disabled={downloadingType !== null}
              className="w-full py-2 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-['Jua'] text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {downloadingType === 'source'
                  ? '다운로드 중...'
                  : '개발용 원본 index.html 다운로드'}
              </span>
            </button>

            {downloadSuccess === 'source' && (
              <p className="text-[11px] text-emerald-700 font-bold mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                원본 index.html 다운로드 완료!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>💡 크롬, 사파리, 엣지 등 어디서나 더블클릭으로 바로 열립니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-['Jua'] text-xs rounded-xl"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

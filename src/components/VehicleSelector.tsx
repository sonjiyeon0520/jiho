import React from 'react';
import { VehicleDefinition, VehicleType } from '../types/vehicle';
import { VEHICLES } from '../data/vehiclesData';
import { sound } from '../services/sound';
import { X, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicleId: VehicleType;
  onSelectVehicle: (vehicleId: VehicleType) => void;
  completedVehicleIds: string[];
}

export const VehicleSelector: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedVehicleId,
  onSelectVehicle,
  completedVehicleIds,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-400 border-b border-amber-500">
          <div>
            <h2 className="font-['Jua'] text-2xl text-slate-950">
              🚜 어떤 탈것을 조립해볼까요?
            </h2>
            <p className="text-xs font-bold text-amber-900">
              좋아하는 탈것이나 중장비를 선택해주세요!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {VEHICLES.map((veh) => {
            const isSelected = veh.id === selectedVehicleId;
            const isCompleted = completedVehicleIds.includes(veh.id);

            return (
              <div
                key={veh.id}
                onClick={() => {
                  onSelectVehicle(veh.id);
                  sound.playPickup();
                  sound.speak(`${veh.koreanName}! 좋은 선택이에요!`);
                  onClose();
                }}
                className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border-3 cursor-pointer transition-all hover:scale-[1.01] ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-300'
                    : 'border-slate-200 hover:border-amber-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Vehicle Color Badge / Icon Box */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0"
                    style={{ backgroundColor: `${veh.primaryColor}25`, border: `2px solid ${veh.primaryColor}` }}
                  >
                    {veh.id === 'excavator' && '🚜'}
                    {veh.id === 'dumptruck' && '🚛'}
                    {veh.id === 'bulldozer' && '🏗️'}
                    {veh.id === 'police' && '🚓'}
                    {veh.id === 'fireengine' && '🚒'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-['Jua'] text-lg text-slate-900">
                        {veh.koreanName}
                      </h3>
                      <span className="text-xs text-slate-500 font-bold">
                        ({veh.name})
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          완성함
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {veh.subTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-amber-800 font-bold">
                      <span>🧩 {veh.pieces.length}조각 조립</span>
                      <span>·</span>
                      <span>🕹️ 원인·결과 작동</span>
                      <span>·</span>
                      <span>🅿️ 주차 미션</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-0 flex items-center gap-2 self-end sm:self-center">
                  <span className="font-['Jua'] text-xs text-amber-600 group-hover:text-amber-700 flex items-center">
                    선택하기
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>💡 굴착기, 불도저, 덤프트럭, 경찰차, 소방차 모두 조립해보세요!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-['Jua'] text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

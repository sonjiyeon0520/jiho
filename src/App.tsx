/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, VehicleType } from './types/vehicle';
import { VEHICLES } from './data/vehiclesData';
import { GameHeader } from './components/GameHeader';
import { PuzzleBoard } from './components/PuzzleBoard';
import { InteractiveRig } from './components/InteractiveRig';
import { ParkingGame } from './components/ParkingGame';
import { VehicleSelector } from './components/VehicleSelector';
import { DownloadModal } from './components/DownloadModal';
import { sound } from './services/sound';

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('assemble');
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleType>('excavator');
  const [completedVehicles, setCompletedVehicles] = useState<string[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);

  const currentVehicle =
    VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0];

  // Record completion
  const handleVehicleCompleted = () => {
    if (!completedVehicles.includes(currentVehicle.id)) {
      setCompletedVehicles((prev) => [...prev, currentVehicle.id]);
    }
  };

  const handleNextVehicle = () => {
    const currentIndex = VEHICLES.findIndex((v) => v.id === selectedVehicleId);
    const nextIndex = (currentIndex + 1) % VEHICLES.length;
    setSelectedVehicleId(VEHICLES[nextIndex].id);
    setCurrentMode('assemble');
    sound.speak(`다음 탈것인 ${VEHICLES[nextIndex].koreanName}를 조립해볼까요?`);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-900 font-['Noto_Sans_KR',sans-serif]">
      {/* Top Bar Header */}
      <GameHeader
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        selectedVehicle={currentVehicle}
        onOpenVehicleSelector={() => setIsSelectorOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
      />

      {/* Main Game Stage */}
      <main className="flex-1 relative overflow-hidden">
        {currentMode === 'assemble' && (
          <PuzzleBoard
            vehicle={currentVehicle}
            onComplete={handleVehicleCompleted}
            onGoToInteractive={() => setCurrentMode('interactive')}
            onGoToParking={() => setCurrentMode('parking')}
          />
        )}

        {currentMode === 'interactive' && (
          <InteractiveRig
            vehicle={currentVehicle}
            onGoToParking={() => setCurrentMode('parking')}
            onGoToAssemble={() => setCurrentMode('assemble')}
          />
        )}

        {currentMode === 'parking' && (
          <ParkingGame
            vehicle={currentVehicle}
            onGoToAssemble={() => setCurrentMode('assemble')}
            onGoToInteractive={() => setCurrentMode('interactive')}
            onNextVehicle={handleNextVehicle}
          />
        )}
      </main>

      {/* Vehicle Selection Modal */}
      <VehicleSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={(id) => {
          setSelectedVehicleId(id);
          setCurrentMode('assemble');
        }}
        completedVehicleIds={completedVehicles}
      />

      {/* index.html Download Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </div>
  );
}

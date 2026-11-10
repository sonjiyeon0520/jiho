export type VehicleType = 'excavator' | 'dumptruck' | 'bulldozer' | 'police' | 'fireengine';

export type GameMode = 'assemble' | 'interactive' | 'parking';

export interface PuzzlePiece {
  id: string;
  name: string;
  description: string; // Educational explanation for kids
  x: number; // Percentage or coordinate in base canvas (0 to 100 or svg coords)
  y: number;
  width: number;
  height: number;
  svgPath: string; // Detailed SVG definition or layer key
  color: string;
  accentColor?: string;
  zIndex: number;
  initialX?: number;
  initialY?: number;
  rotation?: number;
}

export interface InteractiveAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  soundType: 'hydraulic' | 'engine' | 'horn' | 'siren' | 'dump' | 'water' | 'crush';
}

export interface ParkingObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cone' | 'barrier' | 'rock' | 'oil_drum';
}

export interface ParkingLevel {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  startX: number;
  startY: number;
  startAngle: number;
  targetX: number;
  targetY: number;
  targetAngle: number;
  targetWidth: number;
  targetHeight: number;
  obstacles: ParkingObstacle[];
  environment: 'construction' | 'street' | 'quarry' | 'station';
}

export interface VehicleDefinition {
  id: VehicleType;
  name: string;
  koreanName: string;
  subTitle: string;
  category: '중장비' | '긴급출동차';
  primaryColor: string;
  accentColor: string;
  pieces: PuzzlePiece[];
  interactiveActions: InteractiveAction[];
  parkingLevels: ParkingLevel[];
  facts: string[];
}

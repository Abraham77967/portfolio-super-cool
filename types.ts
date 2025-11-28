export enum GestureMode {
  IDLE = 'IDLE',
  PINCHING = 'PINCHING', // Detected pinch, but waiting for timer
  ACTIVE = 'ACTIVE',     // Timer complete, tracking movement
}

export enum Direction {
  NONE = 'NONE',
  STATIONARY = 'STATIONARY',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  DOUBLE_PINCH = 'DOUBLE_PINCH',
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: Landmark[];
  worldLandmarks: Landmark[];
}

export interface AppState {
  isModelLoading: boolean;
  cameraPermission: boolean;
  mode: GestureMode;
  pinchProgress: number; // 0 to 100
  direction: Direction;
  errorMessage?: string;
}
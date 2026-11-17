export type QualityTier = 'full' | 'reduced' | 'fallback';
export type SceneKind = 'shoe' | 'track' | 'medal';
export type TrackNode = { level: number; state: 'passed' | 'available' | 'locked'; label: string };
export type Anchor = { level: number; x: number; y: number };
export type SceneState = { nodes?: TrackNode[]; selected?: number; hovered?: number; unlocked?: number[]; rotationCommand?: { id: number; delta: number } };
export type SceneController = {
  update: (state: SceneState) => void;
  resize: (width: number, height: number) => void;
  active: (active: boolean) => void;
  ready?: Promise<void>;
  pointer?: (x: number, y: number) => void;
  dragStart?: () => void;
  dragMove?: (deltaX: number, width: number, seconds: number) => void;
  dragEnd?: () => void;
  dispose: () => void;
};

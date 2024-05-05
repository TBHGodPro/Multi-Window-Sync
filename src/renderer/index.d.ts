import { Position } from '../types';

export {};

declare global {
  interface Window {
    ipc: {
      onPosition: (cb: (id: number, position: { x: number; y: number }) => void) => void;
      onRemove: (cb: (id: number) => void) => void;
    };
    electronWindow: {
      onMove: (cb: (position: { x: number; y: number }) => void) => void;
      getPosition: () => Position;
      update: (pos?: Position) => void;
    };
  }
}

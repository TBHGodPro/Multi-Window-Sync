export {};

declare global {
  interface Window {
    ipc: {
      onPosition: (cb: (id: number, position: { x: number; y: number }) => void) => void;
      onRemove: (cb: (id: number) => void) => void;
      sendPos: (position: { x: number; y: number }) => void;
    };
    electronWindow: {
      getPosition: InstanceType<typeof import('electron').BrowserWindow>['getPosition'];
      getSize: InstanceType<typeof import('electron').BrowserWindow>['getSize'];
    };
  }
}

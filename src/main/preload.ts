import { contextBridge, ipcRenderer } from 'electron/renderer';
import * as remote from '@electron/remote';

let onMoveFunc: (position: { x: number; y: number }) => void = () => {};

const window = remote.getCurrentWindow();

const updateWinPos = () => {
  const pos = window.getPosition();
  const size = window.getSize();

  const posVal = {
    x: pos[0] + size[0] / 2,
    y: pos[1] + size[1] / 2,
  };

  onMoveFunc(posVal);
  ipcRenderer.send('position', posVal);
};

window.on('move', updateWinPos);
window.on('resize', updateWinPos);

window.on('will-move', updateWinPos);
window.on('will-resize', updateWinPos);

contextBridge.exposeInMainWorld('ipc', {
  onPosition: (cb: (id: number, position: { x: number; y: number }) => void) => ipcRenderer.on('position', (_, id, position) => cb(id, position)),
  onRemove: (cb: (id: number) => void) => ipcRenderer.on('delete', (_, id) => cb(id)),
});
contextBridge.exposeInMainWorld('electronWindow', {
  onMove: (cb: (position: { x: number; y: number }) => void) => {
    onMoveFunc = cb as any;
    updateWinPos();
  },
});

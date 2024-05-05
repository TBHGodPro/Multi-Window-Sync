import { contextBridge, ipcRenderer } from 'electron/renderer';
import * as remote from '@electron/remote';

const window = remote.getCurrentWindow();

contextBridge.exposeInMainWorld('ipc', {
  onPosition: (cb: (id: number, position: { x: number; y: number }) => void) => ipcRenderer.on('position', (_, id, position) => cb(id, position)),
  onRemove: (cb: (id: number) => void) => ipcRenderer.on('delete', (_, id) => cb(id)),
  sendPos: (position: { x: number; y: number }) => ipcRenderer.send('position', position),
});
contextBridge.exposeInMainWorld('electronWindow', {
  getPosition: () => window.getPosition(),
  getSize: () => window.getSize(),
});

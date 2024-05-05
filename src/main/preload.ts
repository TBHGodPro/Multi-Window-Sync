import { contextBridge, ipcRenderer } from 'electron/renderer';
import * as remote from '@electron/remote';
import { WebSocket } from 'ws';
import { WS_HOST, WS_PORT } from '../constants';

let onMoveFunc: (position: { x: number; y: number }) => void = () => {};

const window = remote.getCurrentWindow();

const socket = new WebSocket(`http://${WS_HOST}:${WS_PORT}/`, {
  headers: {
    id: window.webContents.getProcessId(),
  },
});

const queue: string[] = [];

const updateWinPos = () => {
  const pos = window.getPosition();
  const size = window.getSize();

  const posVal = {
    x: pos[0] + size[0] / 2,
    y: pos[1] + size[1] / 2,
  };

  onMoveFunc(posVal);
  const packet = JSON.stringify(posVal);
  if (socket.readyState == WebSocket.OPEN) socket.send(packet);
  else queue.push(packet);
};

window.on('move', updateWinPos);
window.on('resize', updateWinPos);

window.on('moved', updateWinPos);
window.on('resized', updateWinPos);

window.on('will-move', updateWinPos);
window.on('will-resize', updateWinPos);

let onPositionFunc: (id: number, position: { x: number; y: number }) => void = () => {};
let onRemoveFunc: (id: number) => void = () => {};

socket.on('message', raw => {
  const data = JSON.parse(raw.toString());

  console.log(data);

  switch (data.op) {
    case 'position': {
      onPositionFunc(data.id, data.data);
      break;
    }

    case 'delete': {
      onRemoveFunc(data.id);
      break;
    }
  }
});

contextBridge.exposeInMainWorld('ipc', {
  onPosition: (cb: (id: number, position: { x: number; y: number }) => void) => {
    onPositionFunc = cb;
  },
  onRemove: (cb: (id: number) => void) => {
    onRemoveFunc = cb;
  },
});
contextBridge.exposeInMainWorld('electronWindow', {
  onMove: (cb: (position: { x: number; y: number }) => void) => {
    onMoveFunc = cb as any;
    updateWinPos();
  },
});

socket.on('open', () => {
  console.log('Socket Open');
  for (const packet of queue) socket.send(packet);
});
socket.on('close', code => console.log('Socket Closed (' + code + ')'));

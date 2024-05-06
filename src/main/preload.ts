import { contextBridge } from 'electron/renderer';
import * as remote from '@electron/remote';
import { CONNECTION_TYPE } from '../constants';
import Client from '../connection/client/Client';
import { Position } from '../types';
import createClient from '../connection/client/Create';

let onMoveFunc: (position: Position) => void = () => {};

const window = remote.getCurrentWindow();

const client: Client = createClient(CONNECTION_TYPE, window);

client.init();

const getPosition = () => {
  const pos = window.getPosition();
  const size = window.getSize();

  return {
    x: pos[0] + size[0] / 2,
    y: pos[1] + size[1] / 2,
  };
};

let lastPos: Position = getPosition();
const updateWinPos = (pos?: Position) => {
  if (pos?.x === undefined || pos?.y === undefined) pos = getPosition();
  if (pos === lastPos) return;
  lastPos = pos;

  onMoveFunc(pos);
  client.sendMove(pos);
};

window.on('move', updateWinPos);
window.on('resize', updateWinPos);

window.on('moved', updateWinPos);
window.on('resized', updateWinPos);

window.on('will-move', updateWinPos as any);
window.on('will-resize', updateWinPos as any);

contextBridge.exposeInMainWorld('ipc', {
  onPosition: (cb: (id: number, position: Position) => void) => {
    client.onPosition(cb);
  },
  onRemove: (cb: (id: number) => void) => {
    client.onDelete(cb);
  },
});
contextBridge.exposeInMainWorld('electronWindow', {
  onMove: (cb: (position: Position) => void) => {
    onMoveFunc = cb as any;
    updateWinPos();
  },
  getPosition,
  update: updateWinPos,
});

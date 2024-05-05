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

const updateWinPos = () => {
  const pos = window.getPosition();
  const size = window.getSize();

  const posVal = {
    x: pos[0] + size[0] / 2,
    y: pos[1] + size[1] / 2,
  };

  onMoveFunc(posVal);
  client.sendMove(posVal);
};

window.on('move', updateWinPos);
window.on('resize', updateWinPos);

window.on('moved', updateWinPos);
window.on('resized', updateWinPos);

window.on('will-move', updateWinPos);
window.on('will-resize', updateWinPos);

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
});

import { ipcRenderer } from 'electron/renderer';
import { Position } from '../../../types';
import Client from '../Client';

export default class IPCClient extends Client {
  public init(): void {
    ipcRenderer.on('position', (_, id, pos) => this.onPositionFunc(id, pos));
    ipcRenderer.on('delete', (_, id) => this.onDeleteFunc(id));
  }

  public sendMove(pos: Position): void {
    ipcRenderer.send('position', pos);
  }
}

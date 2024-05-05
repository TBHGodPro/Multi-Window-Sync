import { ipcMain } from 'electron';
import { Position } from '../../types';
import Server from './Server';

export default class IPCServer extends Server {
  public init(): void {
    ipcMain.on('position', (event, pos) => {
      this.sendFrom(event.processId, 'position', pos);
    });
  }

  public supplyWindow(window: Electron.CrossProcessExports.BrowserWindow): void {
    const id = window.webContents.getProcessId();
    this.windows.forEach(win => {
      if (win.id != id) {
        const pos = win.win.getPosition();
        const size = win.win.getSize();

        window.webContents.send('position', win.id, {
          x: pos[0] + size[0] / 2,
          y: pos[1] + size[1] / 2,
        });
      }
    });
  }

  public sendFrom(id: number, op: 'position', data: Position): void;
  public sendFrom(id: number, op: 'delete'): void;
  public sendFrom(id: number, op: 'position' | 'delete', data?: Position): void {
    this.windows.forEach(win => {
      if (win.id != id) win.win.webContents.send(op, id, data);
    });
  }

  public close(id: number): void {
    this.sendFrom(id, 'delete');
    this.windows.delete(id);
  }
}

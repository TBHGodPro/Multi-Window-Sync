import { Position } from '../../../types';
import Server from '../Server';

export default class DirectNetSocketServer extends Server {
  public init(): void {}

  public supplyWindow(window: Electron.CrossProcessExports.BrowserWindow): void {
    const id = window.webContents.getProcessId();
    this.windows.forEach(win => {
      //   win.win.webContents.send('id', id);
      window.webContents.send('id', win.id);
    });
  }

  public sendFrom(id: number, op: 'position', data: Position): void;
  public sendFrom(id: number, op: 'delete'): void;
  public sendFrom(id: number, op: 'position' | 'delete', data?: Position): void;
  public sendFrom(id: unknown, op: unknown, data?: unknown): void {}

  public close(id: number): void {
    this.windows.delete(id);
  }
}

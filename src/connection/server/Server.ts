import { BrowserWindow } from 'electron';
import { Position } from '../../types';

export default abstract class Server {
  public readonly windows: Map<
    number,
    {
      win: BrowserWindow;
      id: number;
    }
  > = new Map();

  constructor() {}

  public addWindow(window: BrowserWindow): number {
    const id = window.webContents.getProcessId();

    if (!this.windows.has(id) || this.windows.get(id).win !== window)
      this.windows.set(id, {
        win: window,
        id,
      });

    this.supplyWindow(window);

    return id;
  }

  public abstract init(): void;

  public abstract supplyWindow(window: BrowserWindow): void;

  public abstract sendFrom(id: number, op: 'position', data: Position): void;
  public abstract sendFrom(id: number, op: 'delete'): void;
  public abstract sendFrom(id: number, op: 'position' | 'delete', data?: Position): void;

  public abstract close(id: number): void;
}

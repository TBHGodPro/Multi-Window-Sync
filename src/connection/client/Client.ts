import { BrowserWindow } from 'electron';
import { Position } from '../../types';

export default abstract class Client {
  protected onPositionFunc: (id: number, position: Position) => void = () => {};
  protected onDeleteFunc: (id: number) => void = () => {};

  public readonly id: number;

  constructor(window: BrowserWindow) {
    this.id = window.webContents.getProcessId();
  }

  public abstract init(): void;

  public abstract sendMove(pos: Position): void;

  public onPosition(cb: typeof this.onPositionFunc): void {
    this.onPositionFunc = cb;
  }

  public onDelete(cb: typeof this.onDeleteFunc): void {
    this.onDeleteFunc = cb;
  }
}

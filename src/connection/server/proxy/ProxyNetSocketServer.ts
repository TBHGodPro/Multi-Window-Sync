import { Position } from '../../../types';
import Server from '../Server';
import { WS_HOST, WS_PORT } from '../../../constants';
import { Server as NetServer, Socket } from 'net';
import BufferUtil from '../../util/Buffer';
import { once } from 'events';

export default class ProxyNetSocketServer extends Server {
  public server: NetServer;
  public sockets: Map<number, Socket> = new Map();

  public init(): void {
    this.server = new NetServer(async socket => {
      const idData = (await once(socket, 'data'))[0] as Buffer;
      let id = BufferUtil.readDelete(idData).id;

      if (this.sockets.has(id)) return socket.end();

      const started = Date.now();

      if (!this.windows.has(id)) {
        while (!this.windows.has(id) && Date.now() - started < 2_000) {
          await new Promise(res => setTimeout(res, 0));
        }
        if (!this.windows.has(id)) return socket.end();
      }

      id = this.windows.get(id).id;

      this.sockets.set(id, socket);

      socket.on('data', raw => {
        // const data = BufferUtil.readMiniPosition(raw as Buffer);

        this.windows.forEach(win => {
          if (win.id !== id) this.sockets.get(win.id)?.write(/*BufferUtil.writePosition(id, data.pos)*/ raw);
        });
      });

      socket.on('close', () => {
        this.sockets.delete(id);
        socket.destroy();
      });
    });

    this.server.listen(WS_PORT, WS_HOST, () => null);
  }

  public async supplyWindow(window: Electron.CrossProcessExports.BrowserWindow): Promise<void> {
    const id = window.webContents.getProcessId();
    while (!this.sockets.has(id)) {
      await new Promise(res => setTimeout(res, 2));
    }
    const socket = this.sockets.get(id);
    while (socket.readyState !== 'open') {
      await new Promise(res => setTimeout(res, 2));
    }
    this.windows.forEach(win => {
      if (win.id != id) {
        const pos = win.win.getPosition();
        const size = win.win.getSize();

        socket.write(
          BufferUtil.writePosition(win.id, {
            x: pos[0] + size[0] / 2,
            y: pos[1] + size[1] / 2,
          })
        );
      }
    });
  }

  public sendFrom(id: number, op: 'position', data: Position): void;
  public sendFrom(id: number, op: 'delete'): void;
  public sendFrom(id: number, op: 'position' | 'delete', data?: Position): void {
    this.windows.forEach(win => {
      if (win.id != id) this.sockets.get(win.id).write(op === 'position' ? BufferUtil.writePosition(id, data) : BufferUtil.writeDelete(id));
    });
  }

  public close(id: number): void {
    this.sockets.get(id).end();
    this.sendFrom(id, 'delete');
    this.sockets.get(id).destroy();
    this.sockets.delete(id);
    this.windows.delete(id);
  }
}

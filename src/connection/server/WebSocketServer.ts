import { Position } from '../../types';
import Server from './Server';
import { WebSocketServer as WSS, WebSocket } from 'ws';
import { WS_HOST, WS_PORT } from '../../constants';

export default class WebSocketServer extends Server {
  public server: WSS;
  public sockets: Map<number, WebSocket> = new Map();

  public init(): void {
    this.server = new WSS({
      host: WS_HOST,
      port: WS_PORT,
    });

    this.server.on('connection', async (socket, req) => {
      let started = Date.now();

      let id = parseInt(req.headers['id'] as any);
      if (!this.windows.has(id)) {
        while (!this.windows.has(id) && Date.now() - started < 2_000) {
          await new Promise(res => setTimeout(res, 0));
        }
        if (!this.windows.has(id)) return socket.close(4001);
      }

      id = this.windows.get(id).id;

      this.sockets.set(id, socket);

      socket.on('message', raw => {
        const data = JSON.parse(raw.toString());

        this.windows.forEach(win => {
          if (win.id !== id)
            this.sockets.get(win.id)?.send(
              JSON.stringify({
                op: 'position',
                id,
                data,
              })
            );
        });
      });

      socket.on('close', () => {
        if (this.sockets.has(id)) this.sockets.delete(id);
      });
    });
  }

  public async supplyWindow(window: Electron.CrossProcessExports.BrowserWindow): Promise<void> {
    const id = window.webContents.getProcessId();
    while (!this.sockets.has(id)) {
      await new Promise(res => setTimeout(res, 2));
    }
    const socket = this.sockets.get(id);
    this.windows.forEach(win => {
      if (win.id != id) {
        const pos = win.win.getPosition();
        const size = win.win.getSize();

        socket.send(
          JSON.stringify({
            op: 'position',
            id: win.id,
            data: {
              x: pos[0] + size[0] / 2,
              y: pos[1] + size[1] / 2,
            },
          })
        );
      }
    });
  }

  public sendFrom(id: number, op: 'position', data: Position): void;
  public sendFrom(id: number, op: 'delete'): void;
  public sendFrom(id: number, op: 'position' | 'delete', data?: Position): void {
    this.windows.forEach(win => {
      if (win.id != id)
        this.sockets.get(win.id).send(
          JSON.stringify({
            op,
            id,
            data,
          })
        );
    });
  }

  public close(id: number): void {
    this.sockets.get(id).close(4000);
    this.sendFrom(id, 'delete');
    this.sockets.get(id).terminate();
    this.sockets.delete(id);
    this.windows.delete(id);
  }
}

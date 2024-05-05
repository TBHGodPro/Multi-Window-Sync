import { ipcRenderer } from 'electron/renderer';
import { Position } from '../../types';
import BufferUtil from '../util/Buffer';
import Client from './Client';
import { WebSocketServer, WebSocket } from 'ws';

export default class WSS2Client extends Client {
  public server: WebSocketServer;
  private lastPos: Position = { x: 0, y: 0 };
  public sockets: Map<number, WebSocket> = new Map();

  public init(): void {
    this.server = new WebSocketServer({
      port: 6500 + this.id,
    });

    this.server.on('connection', (socket, req) => {
      const id = parseInt(req.headers['id'] as any);
      if (this.sockets.has(id)) return socket.close(4001);

      socket.send(BufferUtil.writeMiniPosition(this.lastPos));

      this.sockets.set(id, socket);

      socket.on('message', raw => {
        const data = BufferUtil.readMiniPosition(raw as Buffer);

        this.onPositionFunc(id, data.pos);
      });

      socket.on('close', code => {
        console.log(`Socket to ${id} Closed (${code}) (WSS)`);
        socket.terminate();
        this.sockets.delete(id);
        this.onDeleteFunc(id);
      });

      // socket.on('open', () => console.log(`Socket to ${id} Open (WSS)`));
      console.log(`Socket to ${id} Open (WSS)`);
    });

    ipcRenderer.on('id', (event, ...ids) => {
      for (const id of ids) {
        if (this.sockets.has(id)) continue;

        const socket = new WebSocket(`http://localhost:${6500 + id}/`, {
          headers: {
            id: this.id,
          },
        });

        this.sockets.set(id, socket);

        socket.on('message', raw => {
          const data = BufferUtil.readMiniPosition(raw as Buffer);

          this.onPositionFunc(id, data.pos);
        });

        socket.on('close', code => {
          console.log(`Socket to ${id} Closed (${code}) (WS)`);
          socket.terminate();
          this.sockets.delete(id);
          this.onDeleteFunc(id);
        });

        socket.on('open', () => {
          console.log(`Socket to ${id} Open (WS)`);
          socket.send(BufferUtil.writeMiniPosition(this.lastPos));
        });
      }
    });
  }

  public sendMove(pos: Position): void {
    if (pos === this.lastPos) return;
    this.lastPos = pos;
    const packet = BufferUtil.writeMiniPosition(pos);
    this.sockets.forEach(socket => socket.send(packet));
  }
}

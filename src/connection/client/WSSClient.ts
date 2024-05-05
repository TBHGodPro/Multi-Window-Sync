import { ipcRenderer } from 'electron/renderer';
import { Position } from '../../types';
import BufferUtil from '../util/Buffer';
import Client from './Client';
import { WebSocketServer, WebSocket } from 'ws';

export default class WSSClient extends Client {
  public server: WebSocketServer;
  private lastPos: Position = { x: 0, y: 0 };

  public init(): void {
    this.server = new WebSocketServer({
      port: 6500 + this.id,
    });

    this.server.on('connection', socket => {
      socket.send(BufferUtil.writeMiniPosition(this.lastPos));
    });

    ipcRenderer.on('id', (event, ...ids) => {
      for (const id of ids) {
        const socket = new WebSocket(`http://localhost:${6500 + id}/`);

        socket.on('message', raw => {
          const data = BufferUtil.readMiniPosition(raw as Buffer);

          this.onPositionFunc(id, data.pos);
        });

        socket.on('close', code => {
          console.log(`Socket to ${id} Closed (${code})`);
          socket.terminate();
          this.onDeleteFunc(id);
        });

        socket.on('open', () => console.log(`Socket to ${id} Open`));
      }
    });
  }

  public sendMove(pos: Position): void {
    if(pos === this.lastPos) return;
    this.lastPos = pos;
    const packet = BufferUtil.writeMiniPosition(pos);
    this.server.clients.forEach(conn => conn.send(packet));
  }
}

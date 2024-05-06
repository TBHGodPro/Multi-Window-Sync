import { ipcRenderer } from 'electron/renderer';
import { Position } from '../../types';
import BufferUtil from '../util/Buffer';
import Client from './Client';
import { Server, Socket } from 'net';
import { once } from 'events';

export default class NetSocketClient extends Client {
  public server: Server;
  private lastPos: Position = { x: 0, y: 0 };
  public sockets: Map<number, Socket> = new Map();

  public init(): void {
    this.server = new Server(async socket => {
      const idData = (await once(socket, 'data'))[0] as Buffer;
      const id = BufferUtil.readDelete(idData).id;

      if (this.sockets.has(id)) return socket.end();

      this.sockets.set(id, socket);

      socket.on('data', raw => {
        const data = BufferUtil.readMiniPosition(raw as Buffer);

        this.onPositionFunc(id, data.pos);
      });

      socket.on('close', () => {
        console.log(`Socket to ${id} Closed (WSS)`);
        socket.destroy();
        this.sockets.delete(id);
        this.onDeleteFunc(id);
      });

      console.log(`Socket to ${id} Open (WSS)`);

      socket.write(BufferUtil.writeMiniPosition(this.lastPos));
    });

    ipcRenderer.on('id', (event, ...ids) => {
      for (const id of ids) {
        if (this.sockets.has(id)) continue;

        const socket = new Socket();

        this.sockets.set(id, socket);

        socket.on('data', raw => {
          const data = BufferUtil.readMiniPosition(raw as Buffer);

          this.onPositionFunc(id, data.pos);
        });

        socket.on('close', () => {
          console.log(`Socket to ${id} Closed (WS)`);
          socket.destroy();
          this.sockets.delete(id);
          this.onDeleteFunc(id);
        });

        socket.on('ready', async () => {
          console.log(`Socket to ${id} Open (WS)`);
          socket.write(BufferUtil.writeDelete(this.id));
          await new Promise(res => setTimeout(res, 100));
          socket.write(BufferUtil.writeMiniPosition(this.lastPos));
        });

        socket.connect({
          port: 6500 + id,
        });
      }
    });

    this.server.listen(6500 + this.id, () => console.log('Server Listening'));
  }

  public sendMove(pos: Position): void {
    if (pos === this.lastPos) return;
    this.lastPos = pos;
    const packet = BufferUtil.writeMiniPosition(pos);
    this.sockets.forEach(socket => socket.write(packet));
  }
}

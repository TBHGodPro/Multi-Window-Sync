import { WS_HOST, WS_PORT } from '../../../constants';
import { Position } from '../../../types';
import BufferUtil from '../../util/Buffer';
import Client from '../Client';
import { Socket, SocketReadyState } from 'net';

export default class ProxyNetSocketClient extends Client {
  public socket: Socket;
  private queue: Buffer[] = [];

  public init(): void {
    console.log(this.socket ? 'Reopening Socket...' : 'Opening Socket...');
    this.socket = new Socket();

    this.socket.on('data', raw => {
      if (raw.length > 5) {
        this.socket.emit('data', raw.slice(5));
        raw = raw.slice(0, 5);
      }

      const data = BufferUtil.read(raw as Buffer);

      switch (data.op) {
        case 'position': {
          this.onPositionFunc(data.data.id, data.data.pos);
          break;
        }

        case 'delete': {
          this.onDeleteFunc(data.data.id);
          break;
        }
      }
    });

    this.socket.on('ready', () => {
      console.log('Socket Open');
      this.queue.forEach(packet => this.socket.write(packet));
      this.queue = [];
    });
    this.socket.on('close', async () => {
      console.log('Socket Closed - Waiting to reopen...');

      await new Promise(res => setTimeout(res, 2_000));

      this.init();
    });

    this.socket.connect({
      host: WS_HOST,
      port: WS_PORT,
    });
  }

  public sendMove(pos: Position): void {
    const packet = BufferUtil.writePosition(this.id, pos);
    if (this.socket.readyState === 'open' && this.queue.length === 0) this.socket.write(packet);
    else this.queue.push(packet);
  }
}

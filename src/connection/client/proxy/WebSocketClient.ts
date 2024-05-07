import { WS_HOST, WS_PORT } from '../../../constants';
import { Position } from '../../../types';
import Client from '../Client';
import { WebSocket } from 'ws';

export default class WebSocketClient extends Client {
  public socket: WebSocket;
  private queue: any[] = [];

  public init(): void {
    console.log(this.socket ? 'Reopening Socket...' : 'Opening Socket...');
    this.socket = new WebSocket(`http://${WS_HOST}:${WS_PORT}/`, {
      headers: {
        id: this.id,
      },
    });

    this.socket.on('message', raw => {
      const data = JSON.parse(raw.toString());

      switch (data.op) {
        case 'position': {
          this.onPositionFunc(data.id, data.data);
          break;
        }

        case 'delete': {
          this.onDeleteFunc(data.id);
          break;
        }
      }
    });

    this.socket.on('open', () => {
      console.log('Socket Open');
      this.queue.forEach(packet => this.socket.send(packet));
      this.queue = [];
    });
    this.socket.on('close', async code => {
      console.log('Socket Closed (' + code + ') - Waiting to reopen...');

      await new Promise(res => setTimeout(res, 2_000));

      this.init();
    });
  }

  public sendMove(pos: Position): void {
    const packet = JSON.stringify(pos);
    if (this.socket?.readyState === WebSocket.OPEN && this.queue.length === 0) this.socket.send(packet);
    else this.queue.push(packet);
  }
}

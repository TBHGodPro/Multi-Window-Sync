import { ConnectionType } from '../../types';
import BufferWebSocketServer from './BufferWebSocketServer';
import IPCServer from './IPCServer';
import Server from './Server';
import WSS2Server from './WSS2Server';
import WSSServer from './WSSServer';
import WebSocketServer from './WebSocketServer';

export default function createServer(type: ConnectionType): Server {
  switch (type) {
    case ConnectionType.IPC:
      return new IPCServer();

    case ConnectionType.WebSocket:
      return new WebSocketServer();

    case ConnectionType.BufferWebSocket:
      return new BufferWebSocketServer();

    case ConnectionType.WSS:
      return new WSSServer();

    case ConnectionType.WSS2:
      return new WSS2Server();
  }
}

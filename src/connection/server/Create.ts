import { ConnectionType } from '../../types';
import BufferWebSocketServer from './proxy/BufferWebSocketServer';
import IPCServer from './proxy/IPCServer';
import DirectNetSocketServer from './direct/DirectNetSocketServer';
import Server from './Server';
import WSS2Server from './direct/WSS2Server';
import WSSServer from './direct/WSSServer';
import WebSocketServer from './proxy/WebSocketServer';
import ProxyNetSocketServer from './proxy/ProxyNetSocketServer';

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

    case ConnectionType.DirectNetSocket:
      return new DirectNetSocketServer();

    case ConnectionType.ProxyNetSocket:
      return new ProxyNetSocketServer();
  }
}

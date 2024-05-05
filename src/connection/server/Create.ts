import { ConnectionType } from '../../types';
import IPCServer from './IPCServer';
import Server from './Server';
import WebSocketServer from './WebSocketServer';

export default function createServer(type: ConnectionType): Server {
  switch (type) {
    case ConnectionType.IPC:
      return new IPCServer();

    case ConnectionType.WebSocket:
      return new WebSocketServer();
  }
}

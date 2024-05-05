import { BrowserWindow } from 'electron';
import { ConnectionType } from '../../types';
import Client from './Client';
import IPCClient from './IPCClient';
import WebSocketClient from './WebSocketClient';
import BufferWebSocketClient from './BufferWebSocketClient';

export default function createClient(type: ConnectionType, window: BrowserWindow): Client {
  switch (type) {
    case ConnectionType.IPC:
      return new IPCClient(window);

    case ConnectionType.WebSocket:
      return new WebSocketClient(window);

    case ConnectionType.BufferWebSocket:
      return new BufferWebSocketClient(window);
  }
}

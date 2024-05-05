import { BrowserWindow } from 'electron';
import { ConnectionType } from '../../types';
import Client from './Client';
import IPCClient from './IPCClient';
import WebSocketClient from './WebSocketClient';

export default function createClient(type: ConnectionType, window: BrowserWindow): Client {
  switch (type) {
    case ConnectionType.IPC:
      return new IPCClient(window);

    case ConnectionType.WebSocket:
      return new WebSocketClient(window);
  }
}

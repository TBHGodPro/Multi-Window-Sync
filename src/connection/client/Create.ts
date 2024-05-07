import { BrowserWindow } from 'electron';
import { ConnectionType } from '../../types';
import Client from './Client';
import IPCClient from './proxy/IPCClient';
import WebSocketClient from './proxy/WebSocketClient';
import BufferWebSocketClient from './proxy/BufferWebSocketClient';
import WSSClient from './direct/WSSClient';
import WSS2Client from './direct/WSS2Client';
import DirectNetSocketClient from './direct/DirectNetSocketClient';
import ProxyNetSocketClient from './proxy/ProxyNetSocketClient';

export default function createClient(type: ConnectionType, window: BrowserWindow): Client {
  switch (type) {
    case ConnectionType.IPC:
      return new IPCClient(window);

    case ConnectionType.WebSocket:
      return new WebSocketClient(window);

    case ConnectionType.BufferWebSocket:
      return new BufferWebSocketClient(window);

    case ConnectionType.WSS:
      return new WSSClient(window);

    case ConnectionType.WSS2:
      return new WSS2Client(window);

    case ConnectionType.DirectNetSocket:
      return new DirectNetSocketClient(window);

    case ConnectionType.ProxyNetSocket:
      return new ProxyNetSocketClient(window);
  }
}

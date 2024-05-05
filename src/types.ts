export interface Position {
  x: number;
  y: number;
}

export enum ConnectionType {
  IPC,
  WebSocket,
  BufferWebSocket
}

export interface Position {
  x: number;
  y: number;
}

export enum ConnectionType {
  // IPC Connection from Client to Server, Server relays to other Clients.
  IPC, // DEPRECATED

  // WebSocket Connection with Stringified JSON from Client to Server, Server relays to other Clients.
  WebSocket, // DEPRECATED

  // WebSocket Connection with Buffer Values from Client to Server, Server relays to other Clients.
  BufferWebSocket, // NOT RECOMMENDED

  // WebSocket Connection with Buffer Values Client to Client, each Client sends out info from its server and connects to server of all others to recieve their data. Clients are given other clients with IPC from Main.
  WSS, // DEPRECATED

  // WebSocket Connection with Buffer Values Client to Client, newer Clients will join servers of older clients, and all sockets are multi-directionally used. Clients (only new ones) are given other clients with IPC from Main.
  WSS2, // NOT RECOMMENDED

  // Just like WSS2, except using native net sockets rather than websockets
  DirectNetSocket, // RECOMMENDED

  // Just like BufferWebSocket, except using native net sockets rather than websockets
  ProxyNetSocket, // RECOMMENDED
}

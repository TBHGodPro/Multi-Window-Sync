import { app, BrowserWindow, screen } from 'electron';
import { resolve } from 'path';
import { initialize, enable } from '@electron/remote/main';
import { WebSocketServer, WebSocket } from 'ws';
import { WS_HOST, WS_PORT } from '../constants';

initialize();

const windows: Map<
  number,
  {
    socket: WebSocket | null;
    win: BrowserWindow;
    id: number;
  }
> = new Map();

const server = new WebSocketServer({
  host: WS_HOST,
  port: WS_PORT,
});

server.on('connection', async (socket, req) => {
  let started = Date.now();

  let id = parseInt(req.headers['id'] as any);
  if (!windows.has(id)) {
    while (!windows.has(id) && Date.now() - started < 2_000) {
      await new Promise(res => setTimeout(res, 0));
    }
    if (!windows.has(id)) return socket.close(4001);
  }

  windows.get(id).socket = socket;

  id = windows.get(id).id;

  windows.forEach(win => {
    if (win.id != id) {
      const pos = win.win.getPosition();
      const size = win.win.getSize();

      socket.send(
        JSON.stringify({
          op: 'position',
          id: win.id,
          data: {
            x: pos[0] + size[0] / 2,
            y: pos[1] + size[1] / 2,
          },
        })
      );
    }
  });

  socket.on('message', raw => {
    const data = JSON.parse(raw.toString());

    windows.forEach(win => {
      if (win.id !== id)
        win.socket?.send(
          JSON.stringify({
            op: 'position',
            id,
            data,
          })
        );
    });
  });

  socket.on('close', () => {
    if (windows.has(id)) windows.get(id).socket = null;
  });
});

async function createWindow(): Promise<BrowserWindow> {
  return new Promise(res => {
    const x = Math.round(Math.random() * screen.getPrimaryDisplay().size.width);
    const y = Math.round(Math.random() * screen.getPrimaryDisplay().size.height);

    const window = new BrowserWindow({
      width: 600,
      height: 600,
      x,
      y,
      titleBarStyle: 'hidden',
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: resolve(__dirname, './preload.js'),
        devTools: true,
        backgroundThrottling: true,
      },
      transparent: true,
    });

    let id;

    window.webContents.once('did-finish-load', () => {
      id = window.webContents.getProcessId();
      windows.set(id, {
        win: window,
        socket: null,
        id,
      });
      setTimeout(() => {
        window.show();
        windows.forEach(win => {
          if (win.id !== id) {
            win.socket?.send(
              JSON.stringify({
                op: 'position',
                id,
                data: { x: x + 300, y: y + 300 },
              })
            );
          }
        });
        res(window);
      }, 150);
    });

    window.once('closed', () => {
      windows.get(id)?.socket?.close(4000);
      windows.forEach(win => {
        if (win.id !== id) win.socket?.send(JSON.stringify({ op: 'delete', id }));
      });
      windows.delete(id);
    });

    window.loadFile(resolve(__dirname, '../../public/index.html'));

    enable(window.webContents);
  });
}

app.on('ready', async () => {
  await Promise.all([createWindow(), createWindow()]);
});

app.on('activate', async () => {
  await createWindow();
});

app.on('window-all-closed', () => {
  // empty
});

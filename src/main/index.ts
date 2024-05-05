import { app, BrowserWindow, screen } from 'electron';
import { resolve } from 'path';
import { initialize, enable } from '@electron/remote/main';
import Server from '../connection/server/Server';
import { CONNECTION_TYPE } from '../constants';
import createServer from '../connection/server/Create';

initialize();

const server: Server = createServer(CONNECTION_TYPE);

server.init();

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
      id = server.addWindow(window);
      setTimeout(() => {
        window.show();
        server.sendFrom(id, 'position', { x: x + 300, y: y + 300 });
        res(window);
      }, 150);
    });

    window.once('closed', () => {
      server.close(id);
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

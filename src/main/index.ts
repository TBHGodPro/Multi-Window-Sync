import { app, BrowserWindow, crashReporter, ipcMain, screen, shell } from 'electron';
import { resolve } from 'path';
import { initialize, enable } from '@electron/remote/main';

initialize();

const windows: BrowserWindow[] = [];

async function createWindow(): Promise<BrowserWindow> {
  return new Promise(res => {
    const window = new BrowserWindow({
      width: 600,
      height: 600,
      x: Math.round(Math.random() * screen.getPrimaryDisplay().size.width),
      y: Math.round(Math.random() * screen.getPrimaryDisplay().size.height),
      titleBarStyle: 'hidden',
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: resolve(__dirname, './preload.js'),
        devTools: true,
      },
      transparent: true,
    });

    let id;

    window.webContents.once('did-finish-load', () => {
      id = window.webContents.getProcessId();
      setTimeout(() => {
        window.show();
        windows.push(window);
        res(window);
      }, 150);
    });

    window.once('closed', () => {
      windows.splice(windows.indexOf(window), 1);
      if (id)
        windows.forEach(win => {
          win.webContents.send('delete', id);
        });
    });

    window.loadFile(resolve(__dirname, '../../public/index.html'));

    enable(window.webContents);
  });
}

app.on('ready', async () => {
  await Promise.all([createWindow(), createWindow()]);
});

app.on('activate', async () => {
  if (windows.length > 0 && (!windows.find(win => win.isFocused()) || app.isHidden())) windows.forEach(win => win.show());
  else await createWindow();
});

app.on('window-all-closed', () => {
  // empty
});

ipcMain.on('position', (event, pos) => {
  windows.forEach(win => {
    if (win.webContents != event.sender) win.webContents.send('position', event.processId, pos);
  });
});

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null = null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0B0E14',
    show: false,
    icon: path.join(process.env.VITE_PUBLIC || '', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  win.once('ready-to-show', () => {
    win?.show();
  });

  win.on('maximize', () => {
    win?.webContents.send('window-state-changed', true);
  });

  win.on('unmaximize', () => {
    win?.webContents.send('window-state-changed', false);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST || '', 'index.html'));
  }
}

// Window Controls IPC
ipcMain.handle('window-minimize', () => {
  win?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
  return win?.isMaximized();
});

ipcMain.handle('window-close', () => {
  win?.close();
});

ipcMain.handle('window-is-maximized', () => {
  return win?.isMaximized() || false;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('open-external', (_event, url: string) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

// GitHub Releases Auto-Update Checker
function fetchLatestRelease(): Promise<{ version: string; url: string; notes: string; downloadUrl?: string } | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/vanaedynak/aniplayer-gemini/releases/latest',
      headers: {
        'User-Agent': 'AniPlayer-Desktop-App',
      },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            resolve(null);
            return;
          }
          const release = JSON.parse(data);
          const tagName = release.tag_name || '';
          const latestVer = tagName.replace(/^v/, '');
          const exeAsset = release.assets?.find((a: any) => a.name.endsWith('.exe'));

          resolve({
            version: latestVer,
            url: release.html_url,
            notes: release.body || '',
            downloadUrl: exeAsset ? exeAsset.browser_download_url : release.html_url,
          });
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

ipcMain.handle('check-for-updates', async () => {
  try {
    const release = await fetchLatestRelease();
    if (!release) return null;

    const currentVersion = app.getVersion();
    const hasUpdate = isNewerVersion(release.version, currentVersion);

    if (hasUpdate) {
      win?.webContents.send('update-available', release);
    }
    return { hasUpdate, release, currentVersion };
  } catch (err) {
    return null;
  }
});

function isNewerVersion(remote: string, current: string): boolean {
  const parse = (v: string) => v.split('.').map((n) => parseInt(n, 10) || 0);
  const r = parse(remote);
  const c = parse(current);
  for (let i = 0; i < Math.max(r.length, c.length); i++) {
    const rv = r[i] || 0;
    const cv = c[i] || 0;
    if (rv > cv) return true;
    if (rv < cv) return false;
  }
  return false;
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

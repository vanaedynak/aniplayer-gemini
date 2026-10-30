import { contextBridge, ipcRenderer } from 'electron';

export interface UpdateInfo {
  version: string;
  url: string;
  notes: string;
  downloadUrl?: string;
}

const electronAPI = {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  setZoomFactor: (factor: number) => ipcRenderer.invoke('set-zoom-factor', factor),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadAndInstallUpdate: (url: string) => ipcRenderer.invoke('download-and-install-update', url),
  onWindowStateChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_event: any, isMaximized: boolean) => callback(isMaximized);
    ipcRenderer.on('window-state-changed', handler);
    return () => ipcRenderer.removeListener('window-state-changed', handler);
  },
  onUpdateAvailable: (callback: (release: UpdateInfo) => void) => {
    const handler = (_event: any, release: UpdateInfo) => callback(release);
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },
  onUpdateProgress: (callback: (progress: { percent: number; downloadedBytes: number; totalBytes: number }) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('update-progress', handler);
    return () => ipcRenderer.removeListener('update-progress', handler);
  },
  onUpdateReady: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('update-ready', handler);
    return () => ipcRenderer.removeListener('update-ready', handler);
  },
  onUpdateError: (callback: (error: string) => void) => {
    const handler = (_event: any, err: string) => callback(err);
    ipcRenderer.on('update-error', handler);
    return () => ipcRenderer.removeListener('update-error', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI?: typeof electronAPI;
  }
}

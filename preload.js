const { contextBridge, ipcRenderer } = require('electron');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTS = ['.mp4', '.mkv', 'avi', '.mov', '.webm'];

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolders: () => ipcRenderer.invoke('dialog:openDirectory'),
  scanByCommands: (commands) => ipcRenderer.invoke('scan-folders-by-commands', commands),
  getImageExtensions: () => IMAGE_EXTS,
  getVideoExtensions: () => VIDEO_EXTS,

  // --- 新增API ---
  saveConfig: (commands) => ipcRenderer.invoke('save-config', commands),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  scanSingleFolder: (folderPath) => ipcRenderer.invoke('scan-single-folder', folderPath),
  scanFolderOfFile: (filePath) => ipcRenderer.invoke('scan-folder-of-file', filePath),
});
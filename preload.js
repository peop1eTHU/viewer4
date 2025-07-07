const { contextBridge, ipcRenderer } = require('electron');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTS = ['.mp4', '.mkv', 'avi', '.mov', '.webm'];

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolders: () => ipcRenderer.invoke('dialog:openDirectory'),
  // 更新API名称和参数
  scanByCommands: (commands) => ipcRenderer.invoke('scan-folders-by-commands', commands),
  getImageExtensions: () => IMAGE_EXTS,
  getVideoExtensions: () => VIDEO_EXTS,
});
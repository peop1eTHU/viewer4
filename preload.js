const { contextBridge, ipcRenderer } = require('electron');

// 将主进程的功能安全地暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  selectFolders: () => ipcRenderer.invoke('dialog:openDirectory'),
  scanFolders: (folders) => ipcRenderer.invoke('scan-folders', folders),
  // 我们可以通过这种方式获取文件类型，而不是在渲染器中硬编码
  getImageExtensions: () => IMAGE_EXTS,
  getVideoExtensions: () => VIDEO_EXTS,
});

// 这些常量在 preload 中定义一次，然后暴露出去
// 这样主进程和渲染进程的定义就统一了
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTS = ['.mp4', '.mkv', 'avi', '.mov', '.webm'];
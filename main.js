const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// 支持的文件扩展名
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTS = ['.mp4', '.mkv', 'avi', '.mov', '.webm'];

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      // __dirname 指向当前文件所在目录
      // preload.js 将在渲染进程加载页面前运行，是安全的通信桥梁
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
  // 如果需要，可以打开开发者工具
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理从渲染进程发来的“选择文件夹”请求
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  });
  if (canceled) {
    return [];
  } else {
    return filePaths;
  }
});

// 递归地遍历文件夹并返回所有媒体文件的路径
function walkDir(dir, allFiles = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      walkDir(fullPath, allFiles);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (IMAGE_EXTS.includes(ext) || VIDEO_EXTS.includes(ext)) {
        allFiles.push(fullPath);
      }
    }
  }
  return allFiles;
}


// 处理从渲染进程发来的“扫描文件夹”请求
ipcMain.handle('scan-folders', (event, folders) => {
  let allMediaFiles = [];
  for (const folder of folders) {
    try {
      allMediaFiles = allMediaFiles.concat(walkDir(folder));
    } catch (error) {
      console.error(`Error scanning folder ${folder}:`, error);
      // 可以选择向渲染进程发送错误通知
    }
  }
  // 去重，以防用户添加了重复或嵌套的文件夹
  return [...new Set(allMediaFiles)];
});
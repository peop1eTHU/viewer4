const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTS = ['.mp4', '.mkv', 'avi', '.mov', '.webm'];

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, // 稍微加宽以容纳新UI
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 这个IPC处理器保持不变
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  });
  return canceled ? [] : filePaths;
});

// 递归遍历工具函数保持不变
function walkDir(dir, allFiles = []) {
  try {
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
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error);
  }
  return allFiles;
}

// *** 这是核心修改 ***
// 处理指令列表，而不是文件夹列表
ipcMain.handle('scan-folders-by-commands', (event, commands) => {
  // 使用 Set 来高效地处理添加和删除
  const finalFileSet = new Set();

  for (const command of commands) {
    if (!command.path) continue;

    console.log(`Executing command: ${command.type} on ${command.path}`);
    const filesFromPath = walkDir(command.path);

    if (command.type === 'include') {
      filesFromPath.forEach(file => finalFileSet.add(file));
    } else if (command.type === 'exclude') {
      filesFromPath.forEach(file => finalFileSet.delete(file));
    }
  }

  // 将 Set 转换回数组并返回
  return Array.from(finalFileSet);
});
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// --- 新增: 配置文件路径 ---
// 这会获取一个安全、跨平台的路径来存储应用数据
const userDataPath = app.getPath('userData');
const configFilePath = path.join(userDataPath, 'config.json');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
const VIDEO_EXTS = ['.mp4', '.mkv', 'avi', '.mov', '.webm'];

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
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

// --- IPC 处理器 ---

ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'multiSelections']
  });
  return canceled ? [] : filePaths;
});

// walkDir 函数保持不变...
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

// scan-folders-by-commands 处理器保持不变...
ipcMain.handle('scan-folders-by-commands', (event, commands) => {
  const finalFileSet = new Set();
  for (const command of commands) {
    if (!command.path) continue;
    const filesFromPath = walkDir(command.path);
    if (command.type === 'include') {
      filesFromPath.forEach(file => finalFileSet.add(file));
    } else if (command.type === 'exclude') {
      filesFromPath.forEach(file => finalFileSet.delete(file));
    }
  }
  return Array.from(finalFileSet);
});

// --- 新增: 保存和加载配置的 IPC 处理器 ---

// 处理保存配置的请求
ipcMain.handle('save-config', (event, commands) => {
  try {
    // 将指令列表转换为格式化的JSON字符串并写入文件
    fs.writeFileSync(configFilePath, JSON.stringify(commands, null, 2));
    console.log('Configuration saved to:', configFilePath);
    return { success: true };
  } catch (error) {
    console.error('Failed to save config:', error);
    return { success: false, error: error.message };
  }
});

// 处理加载配置的请求
ipcMain.handle('load-config', () => {
  try {
    // 检查文件是否存在
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath, 'utf8');
      console.log('Configuration loaded from:', configFilePath);
      return JSON.parse(data); // 解析并返回指令列表
    }
    return []; // 如果文件不存在，返回空列表
  } catch (error) {
    console.error('Failed to load config:', error);
    return []; // 如果文件损坏或读取失败，返回空列表
  }
});
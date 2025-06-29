const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

// 将回调式API转换为Promise
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'src/assets/logo.png')
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  
  // 开发模式下打开开发者工具
  // mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// 处理IPC通信
ipcMain.on('app-quit', () => {
  app.quit();
});

ipcMain.on('toggle-dev-tools', () => {
  if (mainWindow) {
    mainWindow.webContents.toggleDevTools();
  }
});

ipcMain.on('open-external-url', (event, url) => {
  // 安全地打开外部URL
  if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    shell.openExternal(url);
  }
});

// 读取目录内容
ipcMain.handle('read-dir', async (event, dirPath) => {
  try {
    if (!dirPath || typeof dirPath !== 'string') {
      return [];
    }

    // 读取目录内容
    const files = await readdir(dirPath);
    
    // 获取每个文件的详细信息
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await stat(filePath);
          return {
            name: file,
            path: filePath.replace(/\\/g, '/'), // 统一使用正斜杠
            isDirectory: stats.isDirectory(),
            size: stats.size,
            mtime: stats.mtime
          };
        } catch (err) {
          console.error(`无法读取文件信息: ${filePath}`, err);
          return null;
        }
      })
    );
    
    // 过滤掉无法读取的文件
    return fileDetails.filter(file => file !== null);
  } catch (err) {
    console.error(`读取目录出错: ${dirPath}`, err);
    return [];
  }
});

// 选择目录
ipcMain.handle('select-directory', async () => {
  try {
    console.log('开始显示目录选择对话框...');
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择音乐文件夹'
    });
    
    console.log('目录选择结果:', result);
    return result;
  } catch (err) {
    console.error('选择目录出错', err);
    return { canceled: true, filePaths: [] };
  }
});
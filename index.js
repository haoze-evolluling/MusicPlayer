const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const os = require('os');

// 将回调式API转换为Promise
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// 禁用GPU加速，在应用启动前设置
app.disableHardwareAcceleration();

// 设置自定义缓存目录
const userDataPath = app.getPath('userData');
const cachePath = path.join(userDataPath, 'Cache');
// 确保缓存目录存在
if (!fs.existsSync(cachePath)) {
  try {
    fs.mkdirSync(cachePath, { recursive: true });
  } catch (err) {
    console.error('创建缓存目录失败:', err);
  }
}
app.setPath('userData', userDataPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
    icon: path.join(__dirname, 'src/assets/logo.png')
  });

  app.commandLine.appendSwitch('--allow-file-access-from-files');
  app.commandLine.appendSwitch('--disable-web-security');
  
  // 添加禁用GPU缓存的命令行参数
  //app.commandLine.appendSwitch('--disable-gpu-cache');

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// 添加全局错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  // 可以在这里添加日志记录或显示错误对话框
});

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
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择音乐文件夹'
    });
    
    return result;
  } catch (err) {
    console.error('选择目录出错', err);
    return { canceled: true, filePaths: [] };
  }
});

// 读取文件内容
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    if (!filePath || typeof filePath !== 'string') {
      console.error('文件路径无效');
      return null;
    }

    // 规范化文件路径
    let normalizedPath = filePath.replace(/\\/g, '/');
    
    // 处理Windows路径格式问题
    if (process.platform === 'win32') {
      // 确保Windows下的路径格式正确
      if (normalizedPath.match(/^[a-zA-Z]:\//)) {
        // 已经是正确的格式，如 C:/path/to/file
      } else if (normalizedPath.match(/^\/[a-zA-Z]:\//)) {
        // 移除开头的斜杠，如 /C:/path/to/file -> C:/path/to/file
        normalizedPath = normalizedPath.substring(1);
      }
    }
    
    // 检查文件是否存在
    try {
      await fs.promises.access(normalizedPath, fs.constants.F_OK);
    } catch (err) {
      console.error(`文件不存在: ${normalizedPath}`);
      return null;
    }
    
    // 读取文件内容
    const data = await readFile(normalizedPath);
    return data;
  } catch (err) {
    console.error(`读取文件出错: ${filePath}`, err);
    return null;
  }
});
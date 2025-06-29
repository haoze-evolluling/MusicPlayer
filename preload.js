const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const { promisify } = require('util');

// 将fs的回调API转换为Promise
const readFile = promisify(fs.readFile);

// 安全地暴露IPC通信接口到渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // 从渲染进程发送消息到主进程
    send: (channel, data) => {
      // 白名单频道
      const validChannels = ['app-quit', 'toggle-dev-tools', 'open-external-url', 'read-dir', 'select-directory'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    
    // 从主进程监听消息
    on: (channel, func) => {
      const validChannels = ['app-message', 'update-available', 'dir-contents'];
      if (validChannels.includes(channel)) {
        // 使用removeListener防止内存泄漏
        ipcRenderer.removeAllListeners(channel);
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    
    // 调用主进程方法并等待结果 (Promise)
    invoke: (channel, data) => {
      const validChannels = ['read-dir', 'select-directory', 'read-file'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      return Promise.reject(new Error(`不允许调用 ${channel}`));
    }
  },
  
  // 提供一些系统信息
  systemInfo: {
    platform: process.platform,
    version: process.getSystemVersion()
  },
  
  // 应用信息
  appInfo: {
    version: process.env.npm_package_version || '6.26.3',
    name: 'Konghou Music Player'
  },
  
  // 本地文件访问API
  localFiles: {
    // 读取目录内容
    readDir: async (dirPath) => {
      try {
        if (!dirPath) {
          console.error('目录路径为空');
          return [];
        }
        const result = await ipcRenderer.invoke('read-dir', dirPath);
        return result;
      } catch (error) {
        console.error('读取目录失败:', error);
        return [];
      }
    },
    
    // 读取文件内容
    readFile: async (filePath) => {
      try {
        if (!filePath) {
          console.error('文件路径为空');
          return null;
        }
        
        // 规范化路径
        const normalizedPath = filePath.replace(/\\/g, '/');
        
        // 调用主进程读取文件
        const data = await ipcRenderer.invoke('read-file', normalizedPath);
        
        if (data) {
          return data;
        } else {
          console.error(`文件读取失败: ${normalizedPath}`);
          return null;
        }
      } catch (error) {
        console.error('读取文件失败:', error);
        return null;
      }
    }
  },
  
  // 对话框API
  dialog: {
    // 选择目录
    selectDirectory: async () => {
      return await ipcRenderer.invoke('select-directory');
    }
  }
}); 
const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露IPC通信接口到渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // 从渲染进程发送消息到主进程
    send: (channel, data) => {
      // 白名单频道
      const validChannels = ['app-quit', 'toggle-dev-tools', 'open-external-url'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    
    // 从主进程监听消息
    on: (channel, func) => {
      const validChannels = ['app-message', 'update-available'];
      if (validChannels.includes(channel)) {
        // 使用removeListener防止内存泄漏
        ipcRenderer.removeAllListeners(channel);
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  },
  
  // 提供一些系统信息
  systemInfo: {
    platform: process.platform,
    version: process.getSystemVersion()
  },
  
  // 应用信息
  appInfo: {
    version: process.env.npm_package_version || '1.0.0',
    name: 'Konghou Music Player'
  }
}); 
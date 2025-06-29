/**
 * 应用主入口
 */

// 检查是否在Electron环境中运行
const isElectron = () => {
    return navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
};

// 创建组件实例并初始化应用
class App {
    constructor() {
        this.initApp();
    }
    
    initApp() {
        // 确保在DOM加载完成后初始化
        const self = this;
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.lyricsManager) {
                window.lyricsManager = new LyricsManager();
            }
            
            // 初始化播放器
            const player = new MusicPlayer();
            
            // 绑定键盘快捷键
            document.addEventListener('keydown', (e) => {
                // 空格键：播放/暂停
                if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    player.togglePlay();
                }
                
                // 左右方向键：调整进度
                if (e.code === 'ArrowLeft' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    if (e.ctrlKey) {
                        player.playPrevious(); // Ctrl+左箭头：上一首
                    } else {
                        player.seekRelative(-10); // 后退10秒
                    }
                }
                
                if (e.code === 'ArrowRight' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    if (e.ctrlKey) {
                        player.playNext(); // Ctrl+右箭头：下一首
                    } else {
                        player.seekRelative(10); // 前进10秒
                    }
                }
                
                // 上下方向键：调整音量
                if (e.code === 'ArrowUp' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    player.adjustVolume(0.1); // 增加10%音量
                }
                
                if (e.code === 'ArrowDown' && !e.target.matches('input, textarea')) {
                    e.preventDefault();
                    player.adjustVolume(-0.1); // 减少10%音量
                }
            });
            
            // 导出到全局，方便调试
            window.player = player;
            
            self.initBackground();
            self.showWelcomeMessage();
            
            // 初始化IPC通信（如果在Electron环境中）
            if (isElectron()) {
                self.initIPC();
            }
            
            // 添加关于按钮
            self.setupAboutButton();
        });
    }
    
    initBackground() {
        // 使用BgInitStatus模块初始化背景
        if (window.BgInitStatus) {
            const bgManager = window.BgInitStatus.initBackgroundManager();
            window.BgInitStatus.ensureBackgroundVisibility();
            
            // 确保设置UI被初始化
            setTimeout(() => {
                window.BgInitStatus.initSettingsUI();
            }, 200);
        } else {
            // 回退方案：直接创建背景管理器实例
            if (!window.backgroundManager) {
                window.backgroundManager = new BackgroundManager();
                
                // 手动初始化设置UI
                setTimeout(() => {
                    if (window.backgroundManager && typeof window.backgroundManager.setupSettingsPanel === 'function') {
                        window.backgroundManager.setupSettingsPanel();
                    }
                }, 200);
            }
        }
    }
    
    showWelcomeMessage() {
        // 使用layer显示欢迎消息，如果layer已加载
        if (typeof layer !== 'undefined') {
            layer.msg('欢迎使用箜篌音乐播放器', {
                offset: 't',
                time: 2000
            });
        }
    }
    
    initIPC() {
        // 与Electron主进程通信
        if (window.electron && window.electron.ipcRenderer) {
            const { ipcRenderer } = window.electron;
            
            // 监听来自主进程的消息
            ipcRenderer.on('app-message', (event, message) => {
                if (window.uiManager) {
                    window.uiManager.showMessage(message);
                }
            });
        }
    }
    
    setupAboutButton() {
        // 在设置面板中添加关于按钮
        const aboutSection = document.querySelector('.settings-section:last-child');
        if (aboutSection) {
            const aboutBtn = document.createElement('button');
            aboutBtn.textContent = '关于';
            aboutBtn.className = 'about-btn';
            aboutBtn.style.marginTop = '10px';
            aboutBtn.style.padding = '5px 10px';
            aboutBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            aboutBtn.style.borderRadius = '3px';
            
            aboutBtn.addEventListener('click', () => {
                if (window.uiManager) {
                    window.uiManager.showAbout();
                }
            });
            
            aboutSection.appendChild(aboutBtn);
        }
    }
}

// 初始化应用
const app = new App();
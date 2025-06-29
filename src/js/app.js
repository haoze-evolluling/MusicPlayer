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
        document.addEventListener('DOMContentLoaded', () => {
            // 初始化背景
            this.initBackground();
            
            // 显示欢迎信息
            this.showWelcomeMessage();
            
            // 初始化IPC通信（如果在Electron环境中）
            if (isElectron()) {
                this.initIPC();
            }
            
            // 添加键盘快捷键支持
            this.setupKeyboardShortcuts();
            
            // 添加关于按钮
            this.setupAboutButton();
        });
    }
    
    initBackground() {
        // 确保背景正确初始化
        if (backgroundManager) {
            console.log('背景已初始化');
            
            // 强制设置背景可见性
            const bgOverlay = document.querySelector('.bg-overlay');
            if (bgOverlay) {
                bgOverlay.style.display = 'block';
                console.log('背景显示已强制设置为可见');
            }
        } else {
            // 如果背景管理器未正确初始化，则在这里创建一个新实例
            console.log('手动创建背景管理器实例');
            new BackgroundManager();
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
                uiManager.showMessage(message);
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // 空格键：播放/暂停
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                if (musicPlayer) {
                    musicPlayer.togglePlay();
                }
            }
            
            // 左右箭头：前一首/下一首
            if (e.code === 'ArrowLeft' && e.ctrlKey) {
                if (musicPlayer) {
                    musicPlayer.playPrevious();
                }
            }
            
            if (e.code === 'ArrowRight' && e.ctrlKey) {
                if (musicPlayer) {
                    musicPlayer.playNext();
                }
            }
            
            // ESC键：退出全屏歌词
            if (e.code === 'Escape') {
                if (lyricsManager && lyricsManager.isFullscreen) {
                    lyricsManager.toggleFullscreen();
                }
            }
        });
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
                uiManager.showAbout();
            });
            
            aboutSection.appendChild(aboutBtn);
        }
    }
}

// 初始化应用
const app = new App();
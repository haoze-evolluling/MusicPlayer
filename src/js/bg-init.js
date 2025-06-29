/**
 * 背景初始化模块
 */

const BgInitStatus = {
    // 背景管理器实例
    instance: null,
    // 设置UI是否已创建
    settingsCreated: false,
    // 设置UI创建锁，防止重复创建
    creatingSettings: false,
    // 初始化背景管理器
    initBackgroundManager() {
        if (window.backgroundManager) {
            this.instance = window.backgroundManager;
            return window.backgroundManager;
        }
        
        const bgManager = new BackgroundManager();
        
        const originalCreateSettingsUI = bgManager.createSettingsUI;
        bgManager.createSettingsUI = function() {
            if (BgInitStatus.settingsCreated || BgInitStatus.creatingSettings) {
                return;
            }
            
            BgInitStatus.creatingSettings = true;
            
            const settingsPanel = document.querySelector('#settings-panel .settings-content');
            if (settingsPanel) {
                const existingSection = settingsPanel.querySelector('.settings-section h3');
                if (existingSection && existingSection.textContent === '背景设置') {
                    BgInitStatus.settingsCreated = true;
                    BgInitStatus.creatingSettings = false;
                    return;
                }
            }
            
            originalCreateSettingsUI.call(this);
            
            BgInitStatus.settingsCreated = true;
            BgInitStatus.creatingSettings = false;
        };
        
        this.instance = bgManager;
        window.backgroundManager = bgManager;
        
        return bgManager;
    },
    // 确保背景可见性
    ensureBackgroundVisibility() {
        if (!this.instance) return;
        
        const bgOverlay = document.querySelector('.bg-overlay');
        if (bgOverlay) {
            if (this.instance.backgroundType === 'gradient') {
                bgOverlay.style.display = 'block';
            } else {
                bgOverlay.style.display = 'none';
            }
        }
    },
    // 初始化设置UI
    initSettingsUI() {
        if (!this.instance) return;
        
        if (typeof this.instance.setupSettingsPanel === 'function') {
            this.instance.setupSettingsPanel();
        }
    }
};

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化背景管理器
    BgInitStatus.initBackgroundManager();
    
    // 确保背景可见
    setTimeout(() => {
        BgInitStatus.ensureBackgroundVisibility();
    }, 500);
    
    // 初始化设置UI
    setTimeout(() => {
        BgInitStatus.initSettingsUI();
    }, 1000);
});

// 导出模块
window.BgInitStatus = BgInitStatus; 
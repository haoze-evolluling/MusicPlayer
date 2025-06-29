/**
 * 背景初始化模块 - 用于协调背景管理器的初始化和设置UI的创建
 */

// 背景管理器初始化状态
const BgInitStatus = {
    // 背景管理器实例
    instance: null,
    // 设置UI是否已创建
    settingsCreated: false,
    // 设置UI创建锁，防止重复创建
    creatingSettings: false,
    // 初始化背景管理器
    initBackgroundManager() {
        console.log('初始化背景管理器...');
        
        // 如果已经初始化，直接返回实例
        if (window.backgroundManager) {
            console.log('背景管理器已存在，使用现有实例');
            this.instance = window.backgroundManager;
            return window.backgroundManager;
        }
        
        // 创建新实例
        console.log('创建新的背景管理器实例');
        const bgManager = new BackgroundManager();
        
        // 覆盖原始的createSettingsUI方法，添加检查以防止重复创建
        const originalCreateSettingsUI = bgManager.createSettingsUI;
        bgManager.createSettingsUI = function() {
            // 如果设置UI已创建或正在创建中，则跳过
            if (BgInitStatus.settingsCreated || BgInitStatus.creatingSettings) {
                console.log('背景设置UI已存在或正在创建，跳过');
                return;
            }
            
            // 设置创建锁
            BgInitStatus.creatingSettings = true;
            
            // 检查是否已存在背景设置区域
            const settingsPanel = document.querySelector('#settings-panel .settings-content');
            if (settingsPanel) {
                const existingSection = settingsPanel.querySelector('.settings-section h3');
                if (existingSection && existingSection.textContent === '背景设置') {
                    console.log('背景设置区域已存在，跳过创建');
                    BgInitStatus.settingsCreated = true;
                    BgInitStatus.creatingSettings = false;
                    return;
                }
            }
            
            // 调用原始方法创建设置UI
            console.log('创建背景设置UI');
            originalCreateSettingsUI.call(this);
            
            // 标记设置UI已创建
            BgInitStatus.settingsCreated = true;
            BgInitStatus.creatingSettings = false;
        };
        
        // 保存实例
        this.instance = bgManager;
        window.backgroundManager = bgManager;
        
        return bgManager;
    },
    // 确保背景可见性
    ensureBackgroundVisibility() {
        if (!this.instance) return;
        
        // 强制设置背景可见性
        const bgOverlay = document.querySelector('.bg-overlay');
        if (bgOverlay) {
            // 根据当前背景类型设置可见性
            if (this.instance.backgroundType === 'gradient') {
                bgOverlay.style.display = 'block';
            } else {
                bgOverlay.style.display = 'none';
            }
            console.log('背景可见性已设置');
        }
    },
    // 初始化设置UI
    initSettingsUI() {
        if (!this.instance) return;
        
        console.log('初始化背景设置UI');
        // 调用背景管理器的setupSettingsPanel方法创建设置UI
        if (typeof this.instance.setupSettingsPanel === 'function') {
            this.instance.setupSettingsPanel();
        } else {
            console.error('背景管理器缺少setupSettingsPanel方法');
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
/**
 * 背景管理模块 - 简化版
 */

class BackgroundManager {
    constructor() {
        this.container = document.body;
        this.init();
    }
    
    init() {
        // 检查是否已存在背景遮罩
        let existingOverlay = document.querySelector('.bg-overlay');
        if (existingOverlay) {
            console.log('背景遮罩已存在，不重复创建');
            this.bgOverlay = existingOverlay;
            return;
        }
        
        // 创建背景遮罩
        this.bgOverlay = document.createElement('div');
        this.bgOverlay.className = 'bg-overlay';
        this.container.appendChild(this.bgOverlay);
        
        // 已经在CSS中设置了浅粉和浅蓝色的渐变背景
        console.log('背景初始化完成 - 使用渐变背景');
    }
}

// 创建背景管理器实例
const backgroundManager = new BackgroundManager(); 
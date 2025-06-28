/**
 * 背景管理模块
 */

class BackgroundManager {
    constructor() {
        this.container = document.body;
        this.currentType = localStorage.getItem(CONFIG.storage.background) || CONFIG.background.defaultType;
        this.customBgUrl = localStorage.getItem(CONFIG.storage.customBg) || '';
        
        this.init();
    }
    
    init() {
        // 创建粒子背景容器
        this.particlesContainer = document.createElement('div');
        this.particlesContainer.id = 'particles-js';
        this.container.appendChild(this.particlesContainer);
        
        // 创建背景遮罩
        this.bgOverlay = document.createElement('div');
        this.bgOverlay.className = 'bg-overlay';
        this.container.appendChild(this.bgOverlay);
        
        // 初始化背景
        this.setBackgroundType(this.currentType);
        
        // 监听设置按钮
        document.querySelectorAll('.bg-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const bgType = btn.dataset.bg;
                this.setBackgroundType(bgType);
                
                // 高亮当前选中的背景按钮
                document.querySelectorAll('.bg-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 如果是自定义背景，触发文件选择
                if (bgType === 'custom') {
                    document.getElementById('custom-bg').click();
                }
            });
        });
        
        // 监听自定义背景文件选择
        document.getElementById('custom-bg').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.customBgUrl = event.target.result;
                    localStorage.setItem(CONFIG.storage.customBg, this.customBgUrl);
                    this.setCustomBackground();
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 加载particles.js库
        this.loadParticlesJS();
    }
    
    loadParticlesJS() {
        // particles.js应该已经在HTML中引入
        if (typeof particlesJS !== 'undefined') {
            this.initParticles();
        } else {
            console.error('particles.js库未加载');
        }
    }
    
    initParticles() {
        particlesJS('particles-js', CONFIG.background.particlesOptions);
    }
    
    setBackgroundType(type) {
        this.currentType = type;
        localStorage.setItem(CONFIG.storage.background, type);
        
        // 重置背景
        this.bgOverlay.style.backgroundImage = 'none';
        
        switch (type) {
            case 'particles':
                this.particlesContainer.style.display = 'block';
                this.bgOverlay.style.opacity = '0';
                break;
            case 'cover':
                this.particlesContainer.style.display = 'none';
                // 封面背景将在播放时设置
                break;
            case 'custom':
                this.particlesContainer.style.display = 'none';
                this.setCustomBackground();
                break;
        }
    }
    
    setCustomBackground() {
        if (this.customBgUrl) {
            this.bgOverlay.style.backgroundImage = `url(${this.customBgUrl})`;
            this.bgOverlay.style.opacity = '0.5';
        }
    }
    
    // 设置当前播放歌曲封面为背景
    setCoverBackground(coverUrl) {
        if (this.currentType === 'cover' && coverUrl) {
            this.bgOverlay.style.backgroundImage = `url(${coverUrl})`;
            this.bgOverlay.style.opacity = '0.5';
        }
    }
}

// 创建背景管理器实例
const backgroundManager = new BackgroundManager(); 
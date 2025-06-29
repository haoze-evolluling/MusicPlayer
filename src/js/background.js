/**
 * 背景管理模块
 */

class BackgroundManager {
    constructor() {
        this.container = document.body;
        this.currentType = localStorage.getItem(CONFIG.storage.background) || 'default';
        this.customBgUrl = localStorage.getItem(CONFIG.storage.customBg) || '';
        this.presetBg = localStorage.getItem('konghou_preset_bg') || 'preset1';
        
        this.init();
    }
    
    init() {
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
        
        // 监听预设背景选择按钮
        document.querySelectorAll('.bg-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const presetType = btn.dataset.bg;
                this.presetBg = presetType;
                localStorage.setItem('konghou_preset_bg', presetType);
                
                // 设置为预设背景类型
                this.setBackgroundType('preset');
                
                // 高亮当前选中的预设背景
                document.querySelectorAll('.bg-preview').forEach(preview => {
                    preview.classList.toggle('active', preview.dataset.bg === presetType);
                });
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
    }
    
    setBackgroundType(type) {
        this.currentType = type;
        localStorage.setItem(CONFIG.storage.background, type);
        
        // 重置背景
        this.bgOverlay.style.backgroundImage = 'none';
        
        switch (type) {
            case 'default':
                // 使用默认背景图片
                this.bgOverlay.style.backgroundImage = 'url(./assets/pic/background.png)';
                this.bgOverlay.style.opacity = '0.5';
                break;
            case 'preset':
                // 使用预设背景
                this.setPresetBackground();
                break;
            case 'cover':
                // 封面背景将在播放时设置
                break;
            case 'custom':
                this.setCustomBackground();
                break;
            default:
                // 默认使用背景图片
                this.bgOverlay.style.backgroundImage = 'url(./assets/pic/background.png)';
                this.bgOverlay.style.opacity = '0.5';
                break;
        }
        
        console.log('设置背景类型:', type, '背景图片:', this.bgOverlay.style.backgroundImage);
    }
    
    setPresetBackground() {
        switch (this.presetBg) {
            case 'preset1':
                this.bgOverlay.style.backgroundImage = 'url(./assets/pic/background.png)';
                break;
            // 可以添加更多预设背景
            default:
                this.bgOverlay.style.backgroundImage = 'url(./assets/pic/background.png)';
        }
        this.bgOverlay.style.opacity = '0.5';
    }
    
    setCustomBackground() {
        if (this.customBgUrl) {
            this.bgOverlay.style.backgroundImage = `url(${this.customBgUrl})`;
            this.bgOverlay.style.opacity = '0.5';
        } else {
            // 如果没有自定义背景，使用默认背景
            this.bgOverlay.style.backgroundImage = 'url(./assets/pic/background.png)';
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
/**
 * 背景管理模块
 */

class BackgroundManager {
    constructor() {
        this.container = document.body;
        this.bgOverlay = null;
        this.bgImage = null;
        
        this.backgroundType = localStorage.getItem('backgroundType') || 'gradient';
        this.currentBackground = localStorage.getItem('currentBackground') || 'back1';
        
        this.imageList = [
            { id: 'back1', name: '背景1', path: 'pic/back (1).png' },
            { id: 'back2', name: '背景2', path: 'pic/back (2).png' },
            { id: 'back3', name: '背景3', path: 'pic/back (3).png' },
            { id: 'back4', name: '背景4', path: 'pic/back (4).png' },
            { id: 'back5', name: '背景5', path: 'pic/back (5).png' },
            { id: 'back6', name: '背景6', path: 'pic/back (6).png' },
            { id: 'back7', name: '背景7', path: 'pic/back (7).png' }
        ];
        
        this.init();
    }
    
    init() {
        this.bgOverlay = document.querySelector('.bg-overlay');
        if (!this.bgOverlay) {
            this.bgOverlay = document.createElement('div');
            this.bgOverlay.className = 'bg-overlay';
            this.container.appendChild(this.bgOverlay);
        }
        
        this.bgImage = document.createElement('img');
        this.bgImage.className = 'bg-image';
        this.bgImage.style.position = 'fixed';
        this.bgImage.style.top = '0';
        this.bgImage.style.left = '0';
        this.bgImage.style.width = '100%';
        this.bgImage.style.height = '100%';
        this.bgImage.style.objectFit = 'cover';
        this.bgImage.style.zIndex = '-1';
        this.bgImage.style.opacity = '0.8';
        this.bgImage.style.display = 'none';
        this.container.appendChild(this.bgImage);
        
        this.applyBackground();
    }
    
    applyBackground() {
        if (this.backgroundType === 'gradient') {
            this.applyGradientBackground();
        } else if (this.backgroundType === 'image') {
            this.applyImageBackground(this.currentBackground);
        }
    }
    
    applyGradientBackground() {
        this.bgOverlay.style.backgroundImage = 'linear-gradient(45deg, #ffccd5 0%, #cce6ff 100%)';
        this.bgOverlay.style.display = 'block';
        this.bgImage.style.display = 'none';
    }
    
    applyImageBackground(imageId) {
        const imageObj = this.imageList.find(img => img.id === imageId);
        if (!imageObj) {
            return;
        }
        
        const imagePath = imageObj.path;
        
        this.bgOverlay.style.display = 'none';
        
        this.bgImage.src = imagePath;
        this.bgImage.style.display = 'block';
        this.bgImage.onerror = () => {
            this.applyGradientBackground();
        };
    }
    
    setBackgroundType(type) {
        if (type === 'gradient' || type === 'image') {
            this.backgroundType = type;
            localStorage.setItem('backgroundType', type);
            this.applyBackground();
            return true;
        }
        return false;
    }
    
    setImageBackground(imageId) {
        this.currentBackground = imageId;
        localStorage.setItem('currentBackground', imageId);
        if (this.backgroundType === 'image') {
            this.applyImageBackground(imageId);
        }
        return true;
    }
    
    setupSettingsPanel() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createSettingsUI();
            });
        } else {
            setTimeout(() => {
                this.createSettingsUI();
            }, 100);
        }
    }
    
    createSettingsUI() {
        const settingsPanel = document.querySelector('#settings-panel .settings-content');
        if (!settingsPanel) {
            return;
        }
        
        const backgroundSection = document.createElement('div');
        backgroundSection.className = 'settings-section';
        backgroundSection.innerHTML = `
            <h3>背景设置</h3>
            <div class="background-type-selector">
                <label>
                    <input type="radio" name="bg-type" value="gradient" ${this.backgroundType === 'gradient' ? 'checked' : ''}>
                    渐变色背景
                </label>
                <label>
                    <input type="radio" name="bg-type" value="image" ${this.backgroundType === 'image' ? 'checked' : ''}>
                    图片背景
                </label>
            </div>
            <div class="background-images" ${this.backgroundType === 'image' ? '' : 'style="display: none;"'}>
                <h4>选择背景图片</h4>
                <div class="image-grid"></div>
            </div>
        `;
        
        const aboutSection = settingsPanel.querySelector('.settings-section');
        settingsPanel.insertBefore(backgroundSection, aboutSection);
        
        const bgTypeRadios = backgroundSection.querySelectorAll('input[name="bg-type"]');
        bgTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const type = e.target.value;
                this.setBackgroundType(type);
                
                const imagesSection = backgroundSection.querySelector('.background-images');
                imagesSection.style.display = type === 'image' ? 'block' : 'none';
            });
        });
        
        // 加载图片预览
        const imageGrid = backgroundSection.querySelector('.image-grid');
        this.loadImagePreviews(imageGrid);
    }
    
    loadImagePreviews(imageGrid) {
        this.imageList.forEach(image => {
            const imageBox = document.createElement('div');
            imageBox.className = 'image-preview-box';
            imageBox.dataset.id = image.id;
            
            if (this.currentBackground === image.id) {
                imageBox.classList.add('selected');
            }
            
            imageBox.innerHTML = `
                <div class="image-preview" style="background-image: url('${image.path}')"></div>
                <div class="image-name">${image.name}</div>
            `;
            
            imageBox.addEventListener('click', () => {
                // 移除其他选中状态
                const selected = imageGrid.querySelector('.image-preview-box.selected');
                if (selected) {
                    selected.classList.remove('selected');
                }
                
                // 设置当前选中
                imageBox.classList.add('selected');
                this.setImageBackground(image.id);
            });
            
            imageGrid.appendChild(imageBox);
        });
    }
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .bg-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
    }
    
    .settings-section {
        margin-bottom: 20px;
    }
    
    .background-type-selector {
        margin-bottom: 15px;
    }
    
    .background-type-selector label {
        margin-right: 15px;
        cursor: pointer;
    }
    
    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        margin-top: 10px;
    }
    
    .image-preview-box {
        border: 2px solid transparent;
        border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .image-preview-box:hover {
        transform: scale(1.05);
    }
    
    .image-preview-box.selected {
        border-color: #1e88e5;
    }
    
    .image-preview {
        height: 80px;
        background-size: cover;
        background-position: center;
    }
    
    .image-name {
        text-align: center;
        padding: 5px;
        font-size: 12px;
        background: rgba(0,0,0,0.5);
        color: white;
    }
`;
document.head.appendChild(style);

// 不再自动创建背景管理器实例，由bg-init.js控制
// const backgroundManager = new BackgroundManager(); 
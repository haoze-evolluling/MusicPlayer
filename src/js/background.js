/**
 * 背景管理模块 - 简化版，支持渐变色和图片背景
 */

class BackgroundManager {
    constructor() {
        // 基本设置
        this.container = document.body;
        this.bgOverlay = null;
        this.bgImage = null;
        
        // 背景设置
        this.backgroundType = localStorage.getItem('backgroundType') || 'gradient';
        this.currentBackground = localStorage.getItem('currentBackground') || 'back1';
        
        // 图片列表 - 使用相对路径
        this.imageList = [
            { id: 'back1', name: '背景1', path: 'pic/back (1).png' },
            { id: 'back2', name: '背景2', path: 'pic/back (2).png' },
            { id: 'back3', name: '背景3', path: 'pic/back (3).png' },
            { id: 'back4', name: '背景4', path: 'pic/back (4).png' },
            { id: 'back5', name: '背景5', path: 'pic/back (5).png' },
            { id: 'back6', name: '背景6', path: 'pic/back (6).png' },
            { id: 'back7', name: '背景7', path: 'pic/back (7).png' }
        ];
        
        // 初始化
        this.init();
    }
    
    // 初始化背景
    init() {
        console.log('初始化背景管理器');
        
        // 创建背景遮罩
        this.bgOverlay = document.querySelector('.bg-overlay');
        if (!this.bgOverlay) {
            this.bgOverlay = document.createElement('div');
            this.bgOverlay.className = 'bg-overlay';
            this.container.appendChild(this.bgOverlay);
        }
        
        // 创建背景图片元素
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
        this.bgImage.style.display = 'none'; // 默认隐藏
        this.container.appendChild(this.bgImage);
        
        // 应用保存的背景设置
        this.applyBackground();
        
        // 不再自动调用设置面板初始化，由bg-init.js控制
        // this.setupSettingsPanel();
    }
    
    // 应用背景设置
    applyBackground() {
        if (this.backgroundType === 'gradient') {
            // 应用渐变背景
            this.applyGradientBackground();
        } else if (this.backgroundType === 'image') {
            // 应用图片背景
            this.applyImageBackground(this.currentBackground);
        }
    }
    
    // 应用渐变背景
    applyGradientBackground() {
        // 显示渐变背景
        this.bgOverlay.style.backgroundImage = 'linear-gradient(45deg, #ffccd5 0%, #cce6ff 100%)';
        this.bgOverlay.style.display = 'block';
        
        // 隐藏图片背景
        this.bgImage.style.display = 'none';
        
        console.log('应用渐变背景');
    }
    
    // 应用图片背景
    applyImageBackground(imageId) {
        const imageObj = this.imageList.find(img => img.id === imageId);
        if (!imageObj) {
            console.error(`未找到图片: ${imageId}`);
            return;
        }
        
        const imagePath = imageObj.path;
        console.log(`尝试应用图片背景: ${imagePath}`);
        
        // 隐藏渐变背景
        this.bgOverlay.style.display = 'none';
        
        // 显示图片背景
        this.bgImage.src = imagePath;
        this.bgImage.style.display = 'block';
        this.bgImage.onload = () => {
            console.log(`图片加载成功: ${imagePath}`);
        };
        this.bgImage.onerror = () => {
            console.error(`图片加载失败: ${imagePath}`);
            // 回退到渐变背景
            this.applyGradientBackground();
        };
        
        console.log(`背景图片已设置: ${imagePath}`);
    }
    
    // 设置背景类型
    setBackgroundType(type) {
        if (type === 'gradient' || type === 'image') {
            this.backgroundType = type;
            localStorage.setItem('backgroundType', type);
            this.applyBackground();
            console.log(`背景类型已设置为: ${type}`);
            return true;
        }
        return false;
    }
    
    // 设置背景图片
    setImageBackground(imageId) {
        this.currentBackground = imageId;
        localStorage.setItem('currentBackground', imageId);
        if (this.backgroundType === 'image') {
            this.applyImageBackground(imageId);
        }
        console.log(`背景图片已设置为: ${imageId}`);
        return true;
    }
    
    // 设置面板初始化
    setupSettingsPanel() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.createSettingsUI();
            });
        } else {
            // DOM已经加载完成
            setTimeout(() => {
                this.createSettingsUI();
            }, 100);
        }
    }
    
    // 创建设置UI
    createSettingsUI() {
        console.log('创建背景设置界面');
        
        // 获取设置面板
        const settingsPanel = document.querySelector('#settings-panel .settings-content');
        if (!settingsPanel) {
            console.error('无法找到设置面板');
            return;
        }
        
        // 创建背景设置区域
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
        
        // 在"关于"部分之前插入背景设置
        const aboutSection = settingsPanel.querySelector('.settings-section');
        settingsPanel.insertBefore(backgroundSection, aboutSection);
        
        // 添加背景类型切换事件
        const bgTypeRadios = backgroundSection.querySelectorAll('input[name="bg-type"]');
        bgTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const type = e.target.value;
                this.setBackgroundType(type);
                
                // 显示或隐藏图片选择区域
                const imagesSection = backgroundSection.querySelector('.background-images');
                imagesSection.style.display = type === 'image' ? 'block' : 'none';
            });
        });
        
        // 加载图片预览
        this.loadImagePreviews(backgroundSection.querySelector('.image-grid'));
    }
    
    // 加载图片预览
    loadImagePreviews(imageGrid) {
        if (!imageGrid) return;
        
        // 清空现有内容
        imageGrid.innerHTML = '';
        
        // 添加图片预览
        this.imageList.forEach(image => {
            const imageId = image.id;
            const imagePath = image.path;
            
            console.log(`创建预览: ${imageId}, 路径: ${imagePath}`);
            
            // 创建预览元素
            const imgElement = document.createElement('div');
            imgElement.className = `bg-preview ${this.currentBackground === imageId ? 'active' : ''}`;
            imgElement.dataset.imageId = imageId;
            
            // 使用实际的img标签而不是背景图片
            const imgPreview = document.createElement('img');
            imgPreview.src = imagePath;
            imgPreview.style.width = '100%';
            imgPreview.style.height = '100%';
            imgPreview.style.objectFit = 'cover';
            imgPreview.style.position = 'absolute';
            imgPreview.style.top = '0';
            imgPreview.style.left = '0';
            imgPreview.style.borderRadius = '6px';
            imgElement.appendChild(imgPreview);
            
            // 添加标签
            const label = document.createElement('span');
            label.className = 'bg-label';
            label.textContent = image.name;
            imgElement.appendChild(label);
            
            // 添加点击事件
            imgElement.addEventListener('click', () => {
                console.log(`选择图片: ${imageId}`);
                
                // 移除其他图片的active类
                imageGrid.querySelectorAll('.bg-preview').forEach(el => {
                    el.classList.remove('active');
                });
                
                // 添加active类到当前图片
                imgElement.classList.add('active');
                
                // 设置背景图片
                this.setImageBackground(imageId);
            });
            
            // 添加应用按钮
            const applyBtn = document.createElement('button');
            applyBtn.className = 'bg-select-btn';
            applyBtn.textContent = '应用';
            applyBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止触发父元素的点击事件
                console.log(`应用图片: ${imageId}`);
                
                // 移除其他图片的active类
                imageGrid.querySelectorAll('.bg-preview').forEach(el => {
                    el.classList.remove('active');
                });
                
                // 添加active类到当前图片
                imgElement.classList.add('active');
                
                // 设置背景图片并切换到图片背景模式
                this.setBackgroundType('image');
                this.setImageBackground(imageId);
                
                // 更新单选按钮状态
                imageGrid.closest('.settings-section').querySelector('input[value="image"]').checked = true;
                imageGrid.closest('.background-images').style.display = 'block';
            });
            
            imgElement.appendChild(applyBtn);
            imageGrid.appendChild(imgElement);
        });
        
        console.log('图片预览已加载');
    }
}

// 不再自动创建背景管理器实例，由bg-init.js控制
// const backgroundManager = new BackgroundManager(); 
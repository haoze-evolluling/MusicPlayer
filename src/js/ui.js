/**
 * UI交互模块
 */

class UIManager {
    constructor() {
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsPanel = document.getElementById('settings-panel');
        this.closeSettingsBtn = document.getElementById('close-settings');
        
        this.bindEvents();
    }
    
    bindEvents() {
        // 标签页切换
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // 设置面板
        this.settingsBtn.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        this.closeSettingsBtn.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        // 点击背景时关闭设置面板
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.toggleSettings();
            }
        });
        
        // 阻止设置内容区域的点击传播到背景
        document.querySelector('.settings-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 为所有按钮添加点击缩放效果
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mousedown', () => {
                btn.classList.add('click-effect');
            });
            
            btn.addEventListener('mouseup', () => {
                btn.classList.remove('click-effect');
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.classList.remove('click-effect');
            });
        });
    }
    
    switchTab(tabName) {
        // 更新标签按钮状态
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // 更新标签内容显示
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }
    
    toggleSettings() {
        const isVisible = this.settingsPanel.style.display === 'flex';
        
        if (isVisible) {
            this.settingsPanel.style.display = 'none';
        } else {
            // 初始化设置面板中的当前值
            this.updateSettingsUI();
            this.settingsPanel.style.display = 'flex';
        }
    }
    
    updateSettingsUI() {
        // 更新背景设置按钮状态
        const currentBgType = localStorage.getItem(CONFIG.storage.background) || CONFIG.background.defaultType;
        document.querySelectorAll('.bg-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.bg === currentBgType);
        });
    }
    
    // 显示消息弹窗
    showMessage(message, type = 'info') {
        if (typeof layer !== 'undefined') {
            layer.msg(message);
        } else {
            alert(message);
        }
    }
    
    // 显示加载动画
    showLoading(message = '加载中...') {
        if (typeof layer !== 'undefined') {
            return layer.load(2, { shade: [0.3, '#000'] });
        }
        return null;
    }
    
    // 关闭加载动画
    closeLoading(loadingId) {
        if (typeof layer !== 'undefined' && loadingId) {
            layer.close(loadingId);
        }
    }
    
    // 显示确认对话框
    showConfirm(message, onConfirm, onCancel) {
        if (typeof layer !== 'undefined') {
            layer.confirm(message, {
                btn: ['确定', '取消']
            }, onConfirm, onCancel);
        } else {
            if (confirm(message)) {
                if (onConfirm) onConfirm();
            } else {
                if (onCancel) onCancel();
            }
        }
    }
    
    // 显示输入对话框
    showPrompt(title, onConfirm) {
        if (typeof layer !== 'undefined') {
            layer.prompt({
                title: title,
                formType: 0
            }, (text, index) => {
                layer.close(index);
                if (onConfirm) onConfirm(text);
            });
        } else {
            const result = prompt(title);
            if (result !== null && onConfirm) {
                onConfirm(result);
            }
        }
    }
    
    // 显示"关于"信息
    showAbout() {
        const aboutContent = `
            <div class="about-dialog">
                <h2>箜篌音乐播放器</h2>
                <p>版本: 1.0.0</p>
                <p>功能丰富的在线音乐播放器，支持在线歌曲搜索、歌词同步显示、多种播放模式等。</p>
                <p>基于Electron开发，提供了响应式界面设计，可在PC和移动设备上使用。</p>
            </div>
        `;
        
        if (typeof layer !== 'undefined') {
            layer.open({
                type: 1,
                title: '关于',
                content: aboutContent,
                area: ['300px', '250px']
            });
        } else {
            alert('箜篌音乐播放器 v1.0.0\n功能丰富的在线音乐播放器');
        }
    }
}

// 全局UI管理器实例
const uiManager = new UIManager(); 
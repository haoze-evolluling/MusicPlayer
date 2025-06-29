/**
 * UI交互模块
 */

class UIManager {
    constructor() {
        console.log('初始化UI管理器...');
        
        // 侧边栏相关元素
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggleBtn = document.getElementById('sidebar-toggle');
        this.mainPlayer = document.querySelector('.main-player');
        
        // 标签页切换相关元素
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // 设置面板相关元素
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsPanel = document.getElementById('settings-panel');
        this.closeSettingsBtn = document.getElementById('close-settings');
        
        // 初始化UI事件
        this.initEvents();
        
        // 从localStorage读取侧边栏状态
        this.loadSidebarState();
        
        // 确保按钮位置正确
        window.addEventListener('load', () => {
            this.updateSidebarTogglePosition();
        });
        
        // 窗口大小变化时更新按钮位置
        window.addEventListener('resize', () => {
            this.updateSidebarTogglePosition();
        });
        
        console.log('UI管理器初始化完成');
    }
    
    initEvents() {
        // 侧边栏折叠/展开 - 改进版
        if (this.sidebarToggleBtn) {
            // 移除可能已存在的事件监听器
            this.sidebarToggleBtn.removeEventListener('click', this.handleSidebarToggle);
            this.sidebarToggleBtn.removeEventListener('touchend', this.handleSidebarToggle);
            
            // 使用箭头函数保持this上下文
            this.handleSidebarToggle = (e) => {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                this.toggleSidebar();
                console.log('侧边栏切换按钮被激活');
            };
            
            // 添加点击事件监听器
            this.sidebarToggleBtn.addEventListener('click', this.handleSidebarToggle);
            
            // 添加触摸事件支持，解决移动设备上的问题
            this.sidebarToggleBtn.addEventListener('touchend', this.handleSidebarToggle);
            
            // 添加键盘事件支持
            this.sidebarToggleBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleSidebar();
                }
            });
            
            console.log('侧边栏切换按钮事件已绑定');
        } else {
            console.error('侧边栏切换按钮不存在');
        }
        
        // 标签页切换
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId);
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
        document.querySelectorAll('button, .file-item, .playlist-item, .tab-btn, .ctrl-btn').forEach(element => {
            element.addEventListener('mousedown', () => {
                element.classList.add('click-scale');
            });
            
            element.addEventListener('mouseup', () => {
                element.classList.remove('click-scale');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('click-scale');
            });
            
            // 添加触摸设备支持
            element.addEventListener('touchstart', () => {
                element.classList.add('click-scale');
            });
            
            element.addEventListener('touchend', () => {
                element.classList.remove('click-scale');
            });
            
            element.addEventListener('touchcancel', () => {
                element.classList.remove('click-scale');
            });
        });
    }
    
    /**
     * 切换侧边栏折叠状态 - 改进版
     */
    toggleSidebar() {
        // 切换侧边栏状态前，先禁用按钮，防止连续点击
        if (!this.sidebarToggleBtn) {
            console.error('侧边栏切换按钮不存在');
            return;
        }
        
        this.sidebarToggleBtn.disabled = true;
        
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            this.sidebar.classList.remove('collapsed');
            console.log('侧边栏展开');
        } else {
            this.sidebar.classList.add('collapsed');
            console.log('侧边栏折叠');
        }
        
        // 立即更新按钮位置，与侧边栏动画同步
        this.updateSidebarTogglePosition();
        
        // 动画结束后再启用按钮
        setTimeout(() => {
            this.sidebarToggleBtn.disabled = false;
        }, 300); // 与CSS中的过渡时间一致
        
        // 保存状态到localStorage
        localStorage.setItem('sidebar_collapsed', this.sidebar.classList.contains('collapsed'));
    }
    
    /**
     * 更新侧边栏切换按钮位置 - 改进版
     */
    updateSidebarTogglePosition() {
        if (!this.sidebarToggleBtn) {
            console.error('侧边栏切换按钮不存在');
            return;
        }
        
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        
        try {
            if (isCollapsed) {
                // 侧边栏收起时，按钮位于页面左侧边缘
                this.sidebarToggleBtn.style.left = '0px';
                // 不需要手动设置箭头方向，CSS会处理
            } else {
                // 侧边栏展开时，按钮位于侧边栏右侧边缘
                const sidebarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'));
                this.sidebarToggleBtn.style.left = `${sidebarWidth}px`;
                // 不需要手动设置箭头方向，CSS会处理
            }
        } catch (error) {
            console.error('更新侧边栏按钮位置失败:', error);
        }
    }
    
    /**
     * 从localStorage加载侧边栏状态 - 改进版
     */
    loadSidebarState() {
        try {
            const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
            
            if (isCollapsed) {
                this.sidebar.classList.add('collapsed');
                console.log('初始化: 侧边栏折叠状态');
            } else {
                this.sidebar.classList.remove('collapsed');
                console.log('初始化: 侧边栏展开状态');
            }
            
            // 使用更长的延迟确保DOM完全加载
            setTimeout(() => {
                this.updateSidebarTogglePosition();
            }, 300);
            
            // 添加一个额外的延迟检查，确保按钮位置正确
            setTimeout(() => {
                this.updateSidebarTogglePosition();
            }, 1000);
        } catch (error) {
            console.error('加载侧边栏状态失败:', error);
        }
    }
    
    /**
     * 切换标签页
     * @param {string} tabId - 标签页ID
     */
    switchTab(tabId) {
        // 移除所有标签按钮的active类
        this.tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });
        
        // 隐藏所有标签内容，显示选中的标签内容
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    }
    
    /**
     * 切换设置面板显示状态
     */
    toggleSettings() {
        if (!this.settingsPanel) {
            console.error('设置面板不存在');
            return;
        }
        
        const isVisible = this.settingsPanel.classList.contains('active');
        
        if (isVisible) {
            // 隐藏设置面板
            this.settingsPanel.classList.remove('active');
        } else {
            // 显示设置面板
            this.settingsPanel.classList.add('active');
        }
        
        console.log(`设置面板状态: ${this.settingsPanel.classList.contains('active') ? '显示' : '隐藏'}`);
    }
    
    /**
     * 更新设置面板UI
     */
    updateSettingsUI() {
        // 背景设置相关代码已移至BackgroundManager类
        console.log('设置面板已更新');
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

// 创建UI管理器实例并保存到全局
if (!window.uiManager) {
    window.uiManager = new UIManager();
    console.log('UI管理器实例已保存到全局');
} else {
    console.warn('UI管理器实例已存在，跳过初始化');
} 
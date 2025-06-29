/**
 * 响应式功能增强模块
 */

class ResponsiveManager {
    constructor() {
        // 初始化响应式管理器
        console.log('初始化响应式管理器...');
        
        // 存储当前设备类型
        this.currentDevice = this.getDeviceType();
        
        // 初始化事件监听
        this.initEvents();
        
        // 初始化侧边栏折叠按钮显示状态
        this.initSidebarToggleVisibility();
        
        // 初始执行一次响应式调整
        this.handleResponsiveChanges();
        
        console.log('响应式管理器初始化完成');
    }
    
    /**
     * 初始化侧边栏折叠按钮显示状态
     */
    initSidebarToggleVisibility() {
        const sidebarToggleBtn = document.getElementById('sidebar-toggle');
        if (!sidebarToggleBtn) return;
        
        // 非桌面端设备隐藏按钮
        if (this.currentDevice === 'mobile' || this.currentDevice === 'small-mobile') {
            sidebarToggleBtn.style.display = 'none';
        } else {
            sidebarToggleBtn.style.display = 'block';
        }
    }
    
    /**
     * 初始化事件监听
     */
    initEvents() {
        // 监听窗口大小变化
        window.addEventListener('resize', this.debounce(() => {
            this.handleResponsiveChanges();
        }, 250));
        
        // 监听设备方向变化
        window.addEventListener('orientationchange', () => {
            // 方向改变后稍微延迟执行，确保DOM已更新
            setTimeout(() => {
                this.handleResponsiveChanges();
            }, 300);
        });
        
        // 监听页面加载完成
        window.addEventListener('load', () => {
            this.handleResponsiveChanges();
        });
    }
    
    /**
     * 处理响应式变化
     */
    handleResponsiveChanges() {
        // 获取当前设备类型
        const newDeviceType = this.getDeviceType();
        
        // 如果设备类型发生变化，执行特定调整
        if (newDeviceType !== this.currentDevice) {
            console.log(`设备类型变更: ${this.currentDevice} -> ${newDeviceType}`);
            this.currentDevice = newDeviceType;
            this.applyDeviceSpecificChanges();
        }
        
        // 根据当前窗口大小调整UI
        this.adjustUIForCurrentSize();
        
        // 调整侧边栏按钮位置
        this.adjustSidebarTogglePosition();
    }
    
    /**
     * 获取当前设备类型
     * @returns {string} 设备类型: desktop, tablet, mobile, small-mobile
     */
    getDeviceType() {
        const width = window.innerWidth;
        
        if (width >= 1024) {
            return 'desktop';
        } else if (width >= 768) {
            return 'tablet';
        } else if (width >= 480) {
            return 'mobile';
        } else {
            return 'small-mobile';
        }
    }
    
    /**
     * 应用设备特定的变化
     */
    applyDeviceSpecificChanges() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggleBtn = document.getElementById('sidebar-toggle');
        
        // 根据设备类型应用不同的设置
        switch (this.currentDevice) {
            case 'desktop':
            case 'tablet':
                // 在桌面和平板上，默认展开侧边栏
                if (sidebar) {
                    sidebar.classList.remove('collapsed');
                }
                // 显示侧边栏折叠按钮
                if (sidebarToggleBtn) {
                    sidebarToggleBtn.style.display = 'block';
                }
                break;
                
            case 'mobile':
            case 'small-mobile':
                // 在移动设备上，可以根据需要设置默认状态
                // 隐藏侧边栏折叠按钮
                if (sidebarToggleBtn) {
                    sidebarToggleBtn.style.display = 'none';
                }
                break;
        }
        
        // 调整侧边栏按钮位置
        this.adjustSidebarTogglePosition();
    }
    
    /**
     * 调整侧边栏切换按钮位置
     */
    adjustSidebarTogglePosition() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggleBtn = document.getElementById('sidebar-toggle');
        
        if (!sidebar || !sidebarToggleBtn) return;
        
        // 如果按钮是隐藏状态，则不进行后续调整
        if (sidebarToggleBtn.style.display === 'none') return;
        
        const isCollapsed = sidebar.classList.contains('collapsed');
        const isPortrait = window.innerHeight > window.innerWidth;
        const isMobile = this.currentDevice === 'mobile' || this.currentDevice === 'small-mobile';
        
        // 重置按钮样式
        sidebarToggleBtn.style.transform = '';
        sidebarToggleBtn.style.top = '';
        sidebarToggleBtn.style.left = '';
        sidebarToggleBtn.style.bottom = '';
        sidebarToggleBtn.style.borderRadius = '';
        
        // 根据设备方向和类型设置按钮位置
        if (isMobile && isPortrait) {
            // 移动设备竖屏模式
            sidebarToggleBtn.style.top = 'auto';
            sidebarToggleBtn.style.bottom = '0';
            sidebarToggleBtn.style.left = '50%';
            sidebarToggleBtn.style.transform = 'translateX(-50%) rotate(90deg)';
            sidebarToggleBtn.style.borderRadius = '8px 8px 0 0';
            
            // 修复旋转后的箭头方向
            const toggleIcon = sidebarToggleBtn.querySelector('.toggle-icon');
            if (toggleIcon) {
                if (isCollapsed) {
                    toggleIcon.style.transform = 'rotate(-45deg)';
                } else {
                    toggleIcon.style.transform = 'rotate(135deg)';
                }
            }
        } else if (isMobile && !isPortrait) {
            // 移动设备横屏模式
            const sidebarWidth = isCollapsed ? 0 : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'));
            sidebarToggleBtn.style.left = `${sidebarWidth}px`;
            sidebarToggleBtn.style.top = '50%';
            sidebarToggleBtn.style.transform = 'translateY(-50%)';
            sidebarToggleBtn.style.borderRadius = '0 4px 4px 0';
            
            // 重置箭头方向
            const toggleIcon = sidebarToggleBtn.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.style.transform = '';
            }
        } else {
            // 桌面和平板模式
            const sidebarWidth = isCollapsed ? 0 : parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'));
            sidebarToggleBtn.style.left = `${sidebarWidth}px`;
            sidebarToggleBtn.style.top = '50%';
            sidebarToggleBtn.style.transform = 'translateY(-50%)';
            sidebarToggleBtn.style.borderRadius = '0 4px 4px 0';
            
            // 重置箭头方向
            const toggleIcon = sidebarToggleBtn.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.style.transform = '';
            }
        }
    }
    
    /**
     * 根据当前窗口大小调整UI
     */
    adjustUIForCurrentSize() {
        // 调整播放控制区域
        this.adjustPlayerControls();
        
        // 调整专辑封面大小
        this.adjustAlbumCover();
        
        // 调整区域间距
        this.adjustSpacing();
        
        // 注意：不再调整歌词容器高度，保持CSS中的固定尺寸
    }
    
    /**
     * 调整区域间距
     */
    adjustSpacing() {
        const mainPlayer = document.querySelector('.main-player');
        const playerContent = document.querySelector('.player-content');
        
        if (!mainPlayer || !playerContent) return;
        
        // 保存当前的padding-top值
        const currentPaddingTop = mainPlayer.style.paddingTop;
        
        // 根据设备类型调整间距
        switch (this.currentDevice) {
            case 'desktop':
                mainPlayer.style.padding = '30px';
                break;
                
            case 'tablet':
                mainPlayer.style.padding = '25px';
                break;
                
            case 'mobile':
                mainPlayer.style.padding = '20px';
                break;
                
            case 'small-mobile':
                mainPlayer.style.padding = '15px';
                break;
        }
        
        // 恢复padding-top值
        if (currentPaddingTop) {
            mainPlayer.style.paddingTop = currentPaddingTop;
        }
    }
    
    /**
     * 调整播放控制区域
     */
    adjustPlayerControls() {
        const playerControls = document.querySelector('.player-controls');
        if (!playerControls) return;
        
        // 根据窗口宽度调整布局
        if (window.innerWidth <= 480) {
            playerControls.classList.add('vertical-layout');
        } else {
            playerControls.classList.remove('vertical-layout');
        }
    }
    
    /**
     * 调整专辑封面大小
     */
    adjustAlbumCover() {
        const albumCover = document.querySelector('.album-cover');
        if (!albumCover) return;
        
        // 根据设备类型调整专辑封面大小
        switch (this.currentDevice) {
            case 'desktop':
                albumCover.style.width = '200px';
                albumCover.style.height = '200px';
                break;
                
            case 'tablet':
                albumCover.style.width = '180px';
                albumCover.style.height = '180px';
                break;
                
            case 'mobile':
                // 检查是否是竖屏模式
                if (window.innerHeight > window.innerWidth) {
                    albumCover.style.width = '140px';
                    albumCover.style.height = '140px';
                } else {
                    albumCover.style.width = '120px';
                    albumCover.style.height = '120px';
                }
                break;
                
            case 'small-mobile':
                // 检查是否是竖屏模式
                if (window.innerHeight > window.innerWidth) {
                    albumCover.style.width = '120px';
                    albumCover.style.height = '120px';
                } else {
                    albumCover.style.width = '100px';
                    albumCover.style.height = '100px';
                }
                break;
        }
    }
    
    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间(毫秒)
     * @returns {Function} 防抖处理后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
}

// 创建响应式管理器实例
const responsiveManager = new ResponsiveManager(); 
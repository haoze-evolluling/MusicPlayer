/**
 * 调试工具模块 - 仅用于开发环境
 */

class DebugTool {
    constructor() {
        this.debugMode = false;
        this.versionElement = document.getElementById('app-version');
        this.toggleButton = document.getElementById('toggle-debug');
        
        this.init();
    }
    
    init() {
        // 显示应用版本
        if (window.electron && window.electron.appInfo) {
            this.versionElement.textContent = `v${window.electron.appInfo.version}`;
        }
        
        // 绑定调试按钮事件
        this.toggleButton.addEventListener('click', () => {
            this.toggleDebugMode();
        });
        
        // 隐藏生产环境中的调试信息
        if (process.env.NODE_ENV === 'production') {
            document.querySelector('.version-info').style.display = 'none';
        }
    }
    
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.debugMode) {
            this.showDebugPanel();
        } else {
            this.hideDebugPanel();
        }
    }
    
    showDebugPanel() {
        // 如果调试面板不存在，创建一个
        if (!document.getElementById('debug-panel')) {
            const panel = document.createElement('div');
            panel.id = 'debug-panel';
            panel.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 5px;
                background-color: rgba(0, 0, 0, 0.8);
                color: #fff;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
                max-width: 300px;
                max-height: 400px;
                overflow: auto;
            `;
            
            // 添加调试功能按钮
            const actions = document.createElement('div');
            actions.innerHTML = `
                <button id="debug-load-demo">加载示例数据</button>
                <button id="debug-toggle-devtools">打开开发者工具</button>
                <button id="debug-test-lyrics">测试歌词</button>
                <button id="debug-test-search">测试搜索</button>
                <hr>
                <div id="debug-info">
                    <p>系统：${window.electron ? window.electron.systemInfo.platform : 'browser'}</p>
                    <p>状态：${musicPlayer ? '播放器已初始化' : '播放器未初始化'}</p>
                </div>
            `;
            
            panel.appendChild(actions);
            document.body.appendChild(panel);
            
            // 添加事件监听
            document.getElementById('debug-load-demo').addEventListener('click', () => {
                this.loadDemoData();
            });
            
            document.getElementById('debug-toggle-devtools').addEventListener('click', () => {
                if (window.electron && window.electron.ipcRenderer) {
                    window.electron.ipcRenderer.send('toggle-dev-tools');
                }
            });
            
            document.getElementById('debug-test-lyrics').addEventListener('click', () => {
                this.testLyrics();
            });
            
            document.getElementById('debug-test-search').addEventListener('click', () => {
                this.testSearch();
            });
        } else {
            document.getElementById('debug-panel').style.display = 'block';
        }
    }
    
    hideDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }
    
    loadDemoData() {
        if (playlistManager && DEMO_DATA) {
            // 将示例播放列表添加到播放列表管理器
            playlistManager.playlists = playlistManager.playlists.concat(DEMO_DATA.playlists);
            playlistManager.renderPlaylists();
            alert('已加载示例播放列表');
        } else {
            alert('播放列表管理器或示例数据未初始化');
        }
    }
    
    testLyrics() {
        if (lyricsManager && DEMO_DATA) {
            // 模拟加载歌词
            lyricsManager.parseLRC(DEMO_DATA.sampleLyric);
            lyricsManager.renderLyrics();
            alert('已加载示例歌词');
        } else {
            alert('歌词管理器或示例数据未初始化');
        }
    }
    
    testSearch() {
        if (DEMO_DATA) {
            // 模拟搜索结果
            const searchResultsContainer = document.querySelector('.search-results');
            const musicSearch = window.musicSearch;
            
            if (musicSearch) {
                const sourceType = document.querySelector('input[name="source"]:checked').value;
                musicSearch.renderSearchResults(DEMO_DATA.searchResults[sourceType] || []);
            } else {
                // 手动渲染
                let html = '<ul class="search-result-list">';
                
                DEMO_DATA.searchResults.github.forEach(track => {
                    html += `
                        <li class="search-result-item">
                            <div class="search-result-info">
                                <div class="search-result-title">${track.title}</div>
                                <div class="search-result-artist">${track.artist}</div>
                            </div>
                            <button class="play-btn">播放</button>
                        </li>
                    `;
                });
                
                html += '</ul>';
                
                searchResultsContainer.innerHTML = html;
            }
            
            // 切换到搜索页面
            document.querySelector('.tab-btn[data-tab="search"]').click();
            alert('已加载示例搜索结果');
        } else {
            alert('示例数据未初始化');
        }
    }
    
    // 添加日志
    log(message) {
        if (this.debugMode) {
            console.log(`[DEBUG] ${message}`);
        }
    }
    
    // 添加错误日志
    error(message) {
        console.error(`[DEBUG-ERROR] ${message}`);
    }
}

// 初始化调试工具
document.addEventListener('DOMContentLoaded', () => {
    window.debugTool = new DebugTool();
}); 
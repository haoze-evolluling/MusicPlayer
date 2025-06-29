/**
 * 音乐搜索模块
 */

class MusicSearch {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchResults = document.querySelector('.search-results');
        this.sourceRadios = document.querySelectorAll('input[name="source"]');
        
        this.currentSource = 'github'; // 默认为GitHub
        this.isSearching = false;
        
        // 初始化时加载自定义仓库设置
        this.loadCustomRepoSettings();
        
        this.bindEvents();
    }
    
    loadCustomRepoSettings() {
        // 从本地存储加载自定义仓库设置
        const customGithubRepo = localStorage.getItem(CONFIG.storage.githubRepo);
        const customGiteeRepo = localStorage.getItem(CONFIG.storage.giteeRepo);
        
        if (customGithubRepo) {
            CONFIG.api.github.repo = customGithubRepo;
        }
        
        if (customGiteeRepo) {
            CONFIG.api.gitee.repo = customGiteeRepo;
        }
    }
    
    bindEvents() {
        // 搜索按钮点击
        this.searchBtn.addEventListener('click', () => {
            this.performSearch();
        });
        
        // 输入框回车
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // 切换搜索源
        this.sourceRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.currentSource = radio.value;
            });
        });
        
        // 设置仓库按钮
        document.getElementById('set-repo-btn').addEventListener('click', () => {
            this.showRepoSettingsDialog();
        });
    }
    
    showRepoSettingsDialog() {
        // 创建模态对话框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        // 创建对话框内容
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>设置音乐仓库</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="repo-settings">
                        <div class="setting-group">
                            <label>GitHub 仓库:</label>
                            <input type="text" id="github-repo-input" placeholder="用户名/仓库名" value="${CONFIG.api.github.repo}">
                        </div>
                        <div class="setting-group">
                            <label>Gitee 仓库:</label>
                            <input type="text" id="gitee-repo-input" placeholder="用户名/仓库名" value="${CONFIG.api.gitee.repo}">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="reset-repos" class="btn-secondary">恢复默认</button>
                    <button id="save-repos" class="btn-primary">保存设置</button>
                </div>
            </div>
        `;
        
        // 添加到文档中
        document.body.appendChild(modal);
        
        // 绑定关闭按钮事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 保存设置
        modal.querySelector('#save-repos').addEventListener('click', () => {
            const githubRepo = modal.querySelector('#github-repo-input').value.trim();
            const giteeRepo = modal.querySelector('#gitee-repo-input').value.trim();
            
            if (githubRepo) {
                CONFIG.api.github.repo = githubRepo;
                localStorage.setItem(CONFIG.storage.githubRepo, githubRepo);
            }
            
            if (giteeRepo) {
                CONFIG.api.gitee.repo = giteeRepo;
                localStorage.setItem(CONFIG.storage.giteeRepo, giteeRepo);
            }
            
            // 显示保存成功提示
            this.showToast('仓库设置已保存');
            
            // 关闭对话框
            document.body.removeChild(modal);
        });
        
        // 重置为默认
        modal.querySelector('#reset-repos').addEventListener('click', () => {
            CONFIG.api.github.repo = CONFIG.api.github.defaultRepo;
            CONFIG.api.gitee.repo = CONFIG.api.gitee.defaultRepo;
            
            localStorage.removeItem(CONFIG.storage.githubRepo);
            localStorage.removeItem(CONFIG.storage.giteeRepo);
            
            modal.querySelector('#github-repo-input').value = CONFIG.api.github.defaultRepo;
            modal.querySelector('#gitee-repo-input').value = CONFIG.api.gitee.defaultRepo;
            
            this.showToast('已恢复默认仓库设置');
        });
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 2秒后自动消失
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }
    
    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query || this.isSearching) return;
        
        this.isSearching = true;
        this.searchBtn.disabled = true;
        this.searchBtn.textContent = '搜索中...';
        this.searchResults.innerHTML = '<div class="loading">正在搜索，请稍候...</div>';
        
        if (this.currentSource === 'github') {
            this.searchGithub(query);
        } else {
            this.searchGitee(query);
        }
    }
    
    searchGithub(query) {
        const apiUrl = `${CONFIG.api.github.baseUrl}/search/code?q=${encodeURIComponent(query)}+in:file+extension:mp3+repo:${CONFIG.api.github.repo}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('GitHub API请求失败');
                }
                return response.json();
            })
            .then(data => {
                this.processGithubResults(data);
            })
            .catch(error => {
                console.error('GitHub搜索出错:', error);
                this.searchResults.innerHTML = `<div class="error">搜索出错: ${error.message}</div>`;
            })
            .finally(() => {
                this.isSearching = false;
                this.searchBtn.disabled = false;
                this.searchBtn.textContent = '搜索';
            });
    }
    
    searchGitee(query) {
        const apiUrl = `${CONFIG.api.gitee.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&owner=${CONFIG.api.gitee.repo.split('/')[0]}&repo=${CONFIG.api.gitee.repo.split('/')[1]}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gitee API请求失败');
                }
                return response.json();
            })
            .then(data => {
                this.processGiteeResults(data);
            })
            .catch(error => {
                console.error('Gitee搜索出错:', error);
                this.searchResults.innerHTML = `<div class="error">搜索出错: ${error.message}</div>`;
            })
            .finally(() => {
                this.isSearching = false;
                this.searchBtn.disabled = false;
                this.searchBtn.textContent = '搜索';
            });
    }
    
    processGithubResults(data) {
        if (!data.items || data.items.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">未找到匹配的歌曲</div>';
            return;
        }
        
        const tracks = data.items.map(item => {
            // 从文件路径提取信息
            const pathParts = item.path.split('/');
            const fileName = pathParts[pathParts.length - 1];
            const fileNameWithoutExt = fileName.replace('.mp3', '');
            
            // 尝试从文件名中解析歌手和标题
            let title = fileNameWithoutExt;
            let artist = 'Unknown';
            
            if (fileNameWithoutExt.includes('-')) {
                const parts = fileNameWithoutExt.split('-');
                artist = parts[0].trim();
                title = parts.slice(1).join('-').trim();
            }
            
            return {
                title,
                artist,
                url: item.html_url.replace('/blob/', '/raw/'),
                // 假设封面和歌词与音乐文件在同一目录
                cover: item.html_url.replace('.mp3', '.jpg').replace('/blob/', '/raw/'),
                lrc: item.html_url.replace('.mp3', '.lrc').replace('/blob/', '/raw/')
            };
        });
        
        this.renderSearchResults(tracks);
    }
    
    processGiteeResults(data) {
        if (!data.items || data.items.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">未找到匹配的歌曲</div>';
            return;
        }
        
        // 处理Gitee结果的格式可能与GitHub不同，需要根据实际API响应进行调整
        const tracks = data.items.filter(item => item.path.endsWith('.mp3')).map(item => {
            // 从文件路径提取信息
            const pathParts = item.path.split('/');
            const fileName = pathParts[pathParts.length - 1];
            const fileNameWithoutExt = fileName.replace('.mp3', '');
            
            // 尝试从文件名中解析歌手和标题
            let title = fileNameWithoutExt;
            let artist = 'Unknown';
            
            if (fileNameWithoutExt.includes('-')) {
                const parts = fileNameWithoutExt.split('-');
                artist = parts[0].trim();
                title = parts.slice(1).join('-').trim();
            }
            
            // Gitee API的URL结构可能与GitHub不同
            const baseUrl = `https://gitee.com/${CONFIG.api.gitee.repo}/raw/master/${item.path}`;
            
            return {
                title,
                artist,
                url: baseUrl,
                cover: baseUrl.replace('.mp3', '.jpg'),
                lrc: baseUrl.replace('.mp3', '.lrc')
            };
        });
        
        this.renderSearchResults(tracks);
    }
    
    renderSearchResults(tracks) {
        if (tracks.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">未找到匹配的歌曲</div>';
            return;
        }
        
        let html = '<ul class="search-result-list">';
        
        tracks.forEach(track => {
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
        
        this.searchResults.innerHTML = html;
        
        // 添加播放按钮事件
        document.querySelectorAll('.search-result-item .play-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.playTrack(tracks, index);
            });
        });
    }
    
    playTrack(tracks, index) {
        // 设置播放列表并开始播放选定的歌曲
        if (musicPlayer) {
            musicPlayer.setPlaylist(tracks, index);
        }
    }
}

// 全局搜索实例
const musicSearch = new MusicSearch(); 
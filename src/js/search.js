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
        
        this.bindEvents();
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
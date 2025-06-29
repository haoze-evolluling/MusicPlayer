/**
 * 音乐仓库文件管理模块
 */

class MusicRepository {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchResults = document.querySelector('.search-results');
        this.sourceRadios = document.querySelectorAll('input[name="source"]');
        
        this.currentSource = 'github'; // 默认为GitHub
        this.isLoading = false;
        this.currentPath = ''; // 当前路径
        
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
        // 搜索按钮改为加载文件列表
        this.searchBtn.addEventListener('click', () => {
            this.loadRepositoryFiles();
        });
        
        // 修改输入框占位符
        this.searchInput.placeholder = "输入路径(留空显示根目录)...";
        
        // 输入框回车
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadRepositoryFiles();
            }
        });
        
        // 切换仓库源
        this.sourceRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.currentSource = radio.value;
                this.currentPath = ''; // 重置路径
                this.loadRepositoryFiles(); // 切换后自动加载
            });
        });
        
        // 设置仓库按钮
        document.getElementById('set-repo-btn').addEventListener('click', () => {
            this.showRepoSettingsDialog();
        });

        // 加载初始文件列表
        setTimeout(() => this.loadRepositoryFiles(), 500);
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
            
            // 重新加载文件列表
            this.loadRepositoryFiles();
            
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
    
    loadRepositoryFiles() {
        const path = this.searchInput.value.trim();
        this.currentPath = path;
        
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.searchBtn.disabled = true;
        this.searchBtn.textContent = '加载中...';
        this.searchResults.innerHTML = '<div class="loading">正在加载文件列表，请稍候...</div>';
        
        if (this.currentSource === 'github') {
            this.loadGithubFiles(path);
        } else {
            this.loadGiteeFiles(path);
        }
    }
    
    loadGithubFiles(path) {
        // 构建API URL，获取仓库内容
        const apiUrl = `${CONFIG.api.github.baseUrl}/repos/${CONFIG.api.github.repo}/contents/${path}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('GitHub API请求失败');
                }
                return response.json();
            })
            .then(data => {
                this.renderFileList(data, 'github');
            })
            .catch(error => {
                console.error('GitHub文件加载出错:', error);
                this.searchResults.innerHTML = `<div class="error">加载出错: ${error.message}</div>`;
            })
            .finally(() => {
                this.isLoading = false;
                this.searchBtn.disabled = false;
                this.searchBtn.textContent = '加载';
            });
    }
    
    loadGiteeFiles(path) {
        // 构建Gitee API URL
        const apiUrl = `${CONFIG.api.gitee.baseUrl}/repos/${CONFIG.api.gitee.repo}/contents/${path}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gitee API请求失败');
                }
                return response.json();
            })
            .then(data => {
                this.renderFileList(data, 'gitee');
            })
            .catch(error => {
                console.error('Gitee文件加载出错:', error);
                this.searchResults.innerHTML = `<div class="error">加载出错: ${error.message}</div>`;
            })
            .finally(() => {
                this.isLoading = false;
                this.searchBtn.disabled = false;
                this.searchBtn.textContent = '加载';
            });
    }
    
    renderFileList(files, source) {
        if (!files || files.length === 0) {
            this.searchResults.innerHTML = '<div class="no-results">此目录为空</div>';
            return;
        }
        
        // 添加返回上级目录选项
        let html = '<div class="file-explorer">';
        if (this.currentPath) {
            html += `<div class="file-item directory" data-path="${this.getParentPath(this.currentPath)}">
                <span class="file-icon">📁</span>
                <span class="file-name">..</span>
                <span class="file-desc">返回上级目录</span>
            </div>`;
        }
        
        // 文件排序：先目录后文件
        files.sort((a, b) => {
            // 目录排在前面
            if (a.type === 'dir' && b.type !== 'dir') return -1;
            if (a.type !== 'dir' && b.type === 'dir') return 1;
            // 同类型按名称排序
            return a.name.localeCompare(b.name);
        });
        
        // 生成文件列表
        files.forEach(file => {
            // 目录
            if (file.type === 'dir') {
                html += `<div class="file-item directory" data-path="${file.path}">
                    <span class="file-icon">📁</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-desc">目录</span>
                </div>`;
            }
            // 音频文件
            else if (file.name.endsWith('.mp3')) {
                const fileName = file.name.replace('.mp3', '');
                let title = fileName;
                let artist = 'Unknown';
                
                if (fileName.includes('-')) {
                    const parts = fileName.split('-');
                    title = parts[0].trim();
                    artist = parts.slice(1).join('-').trim();
                }
                
                html += `<div class="file-item audio" data-path="${file.path}" data-download="${file.download_url || ''}">
                    <span class="file-icon">🎵</span>
                    <span class="file-name">${title}</span>
                    <span class="file-artist">${artist}</span>
                    <button class="play-btn">播放</button>
                </div>`;
            }
            // 歌词文件
            else if (file.name.endsWith('.lrc')) {
                html += `<div class="file-item lyrics" data-path="${file.path}">
                    <span class="file-icon">📝</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-desc">歌词</span>
                </div>`;
            }
            // 图像文件（封面）
            else if (file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
                html += `<div class="file-item image" data-path="${file.path}">
                    <span class="file-icon">🖼️</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-desc">图片</span>
                </div>`;
            }
            // 其他文件
            else {
                html += `<div class="file-item other" data-path="${file.path}">
                    <span class="file-icon">📄</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-desc">${this.getFileSize(file.size)}</span>
                </div>`;
            }
        });
        
        html += '</div>';
        this.searchResults.innerHTML = html;
        
        // 为目录绑定点击事件
        document.querySelectorAll('.file-item.directory').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.getAttribute('data-path');
                this.currentPath = path;
                this.searchInput.value = path;
                this.loadRepositoryFiles();
            });
        });
        
        // 为音频文件绑定播放事件
        document.querySelectorAll('.file-item.audio .play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const fileItem = btn.closest('.file-item');
                const path = fileItem.getAttribute('data-path');
                const downloadUrl = fileItem.getAttribute('data-download') || this.getDownloadUrl(path, source);
                const fileName = path.split('/').pop().replace('.mp3', '');
                
                // 尝试解析歌手和标题
                let title = fileName;
                let artist = 'Unknown';
                
                if (fileName.includes('-')) {
                    const parts = fileName.split('-');
                    title = parts[0].trim();
                    artist = parts.slice(1).join('-').trim();
                }
                
                // 创建音轨
                const track = {
                    title,
                    artist,
                    url: downloadUrl,
                    cover: this.getDownloadUrl(path.replace('.mp3', '.jpg'), source),
                    lrc: this.getDownloadUrl(path.replace('.mp3', '.lrc'), source)
                };
                
                // 播放该音轨
                if (musicPlayer) {
                    musicPlayer.setPlaylist([track], 0);
                }
            });
        });
    }
    
    getParentPath(path) {
        if (!path) return '';
        const parts = path.split('/');
        parts.pop(); // 移除最后一部分
        return parts.join('/');
    }
    
    getFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    getDownloadUrl(path, source) {
        if (source === 'github') {
            // GitHub的原始内容链接
            return `https://raw.githubusercontent.com/${CONFIG.api.github.repo}/master/${path}`;
        } else {
            // Gitee的原始内容链接
            return `https://gitee.com/${CONFIG.api.gitee.repo}/raw/master/${path}`;
        }
    }
}

// 全局仓库实例
const musicRepository = new MusicRepository(); 
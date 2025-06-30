/**
 * 音乐仓库文件管理模块
 */

class MusicRepository {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchResults = document.querySelector('.search-results');
        this.sourceRadios = document.querySelectorAll('input[name="source"]');
        this.setRepoBtn = document.getElementById('set-repo-btn');
        this.selectFolderBtn = document.getElementById('select-folder-btn');
        
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
                
                // 根据选择的源显示对应的按钮
                if (this.currentSource === 'github' || this.currentSource === 'gitee') {
                    this.setRepoBtn.style.display = 'block';
                    this.selectFolderBtn.style.display = 'none';
                } else if (this.currentSource === 'local') {
                    this.setRepoBtn.style.display = 'none';
                    this.selectFolderBtn.style.display = 'block';
                }
                
                this.loadRepositoryFiles(); // 切换后自动加载
            });
        });
        
        // 设置仓库按钮
        this.setRepoBtn.addEventListener('click', () => {
            this.showRepoSettingsDialog();
        });
        
        // 选择文件夹按钮
        this.selectFolderBtn.addEventListener('click', () => {
            this.selectLocalFolder();
        });

        // 加载初始文件列表
        setTimeout(() => this.loadRepositoryFiles(), 500);
    }
    
    async selectLocalFolder() {
        try {
            console.log('开始选择本地音乐文件夹...');
            const success = await localMusicApi.selectMusicFolder();
            
            console.log('文件夹选择结果:', success);
            
            if (success) {
                this.showToast('文件夹选择成功');
                this.loadRepositoryFiles();
            } else {
                this.showToast('文件夹选择取消');
            }
        } catch (error) {
            console.error('选择文件夹出错:', error);
            this.showToast('文件夹选择失败');
        }
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
        } else if (this.currentSource === 'gitee') {
            this.loadGiteeFiles(path);
        } else if (this.currentSource === 'local') {
            this.loadLocalFiles(path);
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
        // 构建API URL，获取仓库内容
        const [owner, repo] = CONFIG.api.gitee.repo.split('/');
        const apiUrl = `${CONFIG.api.gitee.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gitee API请求失败');
                }
                return response.json();
            })
            .then(data => {
                // 保存原始API响应，便于后续使用
                this.giteeApiResponse = data;
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
    
    async loadLocalFiles(path) {
        try {
            // 检查是否已选择文件夹
            if (!localMusicApi.hasMusicFolderSelected()) {
                await this.selectLocalFolder();
                if (!localMusicApi.hasMusicFolderSelected()) {
                    throw new Error('未选择音乐文件夹');
                }
            }
            
            // 获取本地文件列表
            const files = await localMusicApi.getContents(path);
            this.renderFileList(files, 'local');
        } catch (error) {
            console.error('本地文件加载出错:', error);
            this.searchResults.innerHTML = `<div class="error">加载出错: ${error.message}</div>`;
        } finally {
            this.isLoading = false;
            this.searchBtn.disabled = false;
            this.searchBtn.textContent = '加载';
        }
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
        if (source !== 'local') { // 本地文件已经排序
            files.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'dir' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });
        }
        
        // 遍历显示所有文件和文件夹
        files.forEach(file => {
            let fileIcon, isPlayable;
            
            // 根据文件类型设置不同图标
            if (file.type === 'dir' || file.type === 'directory') {
                fileIcon = '📁'; // 文件夹图标
                isPlayable = false;
            } else {
                // 检查是否为音频文件
                if (source === 'local') {
                    isPlayable = localMusicApi.isSupportedAudio(file.name);
                } else {
                    isPlayable = file.name.toLowerCase().endsWith('.mp3');
                }
                
                fileIcon = isPlayable ? '🎵' : '📄';
            }
            
            // 处理文件路径
            let filePath = '';
            if (source === 'github' || source === 'gitee') {
                filePath = file.path;
            } else if (source === 'local') {
                filePath = file.path;
            }
            
            // 构建文件列表项
            html += `<div class="file-item ${file.type === 'dir' || file.type === 'directory' ? 'directory' : 'file'}" 
                      data-path="${filePath}" 
                      data-type="${file.type === 'dir' || file.type === 'directory' ? 'dir' : 'file'}" 
                      data-source="${source}">
                <span class="file-icon">${fileIcon}</span>
                <span class="file-name">${file.name}</span>`;
            
            // 如果是音频文件，添加播放按钮
            if (isPlayable) {
                html += `<button class="play-btn" data-path="${filePath}" data-source="${source}">播放</button>`;
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        
        // 更新结果区域
        this.searchResults.innerHTML = html;
        
        // 绑定目录点击事件
        this.searchResults.querySelectorAll('.file-item.directory').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.getAttribute('data-path');
                this.searchInput.value = path;
                this.loadRepositoryFiles();
            });
        });
        
        // 绑定播放按钮点击事件
        this.searchResults.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation(); // 阻止冒泡，避免触发目录点击
                
                const path = btn.getAttribute('data-path');
                const source = btn.getAttribute('data-source');
                const fileItem = btn.closest('.file-item');
                const fileName = fileItem.querySelector('.file-name').textContent;
                
                try {
                    this.showToast(`正在加载: ${fileName}`);
                    
                    // 根据不同来源处理音频
                    if (source === 'github') {
                        // 从文件创建音轨对象
                        const file = {
                            name: fileName,
                            path: path,
                            download_url: this.getDownloadUrl(path, 'github')
                        };
                        
                        const track = githubApi.fileToTrack(file);
                        window.player.setPlaylist([track], 0);
                    } else if (source === 'gitee') {
                        // 找到对应的文件对象
                        let fileData;
                        
                        // 如果是数组，查找匹配的文件
                        if (Array.isArray(this.giteeApiResponse)) {
                            fileData = this.giteeApiResponse.find(item => item.path === path);
                        } else if (this.giteeApiResponse && this.giteeApiResponse.path === path) {
                            // 如果是单个文件对象且路径匹配
                            fileData = this.giteeApiResponse;
                        }
                        
                        if (!fileData) {
                            throw new Error('未找到文件数据');
                        }
                        
                        // 创建完整的文件对象
                        const file = {
                            name: fileName,
                            path: path,
                            download_url: fileData.download_url || this.getDownloadUrl(path, 'gitee')
                        };
                        
                        const track = giteeApi.fileToTrack(file);
                        console.log('Gitee音轨:', track);
                        window.player.setPlaylist([track], 0);
                    } else if (source === 'local') {
                        // 从文件列表中找到对应的文件对象
                        const files = await localMusicApi.getContents(this.currentPath);
                        const fileObj = files.find(f => f.path === path);
                        
                        if (fileObj) {
                            const track = await localMusicApi.fileToTrack(fileObj);
                            window.player.setPlaylist([track], 0);
                        }
                    }
                } catch (error) {
                    console.error('播放文件出错:', error);
                    this.showToast(`播放出错: ${error.message}`);
                }
            });
        });
    }
    
    getParentPath(path) {
        if (!path) return '';
        let parts = path.split('/');
        parts.pop(); // 移除最后一个部分
        return parts.join('/');
    }
    
    getFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    getDownloadUrl(path, source) {
        if (source === 'github') {
            return `https://raw.githubusercontent.com/${CONFIG.api.github.repo}/master/${path}`;
        } else if (source === 'gitee') {
            return `https://gitee.com/${CONFIG.api.gitee.repo}/raw/master/${path}`;
        } else if (source === 'local') {
            return path; // 本地文件使用File API处理
        }
        return '';
    }
}

// 初始化音乐仓库
const musicRepository = new MusicRepository(); 
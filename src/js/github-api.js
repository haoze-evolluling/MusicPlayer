/**
 * GitHub API 访问模块
 * 用于访问GitHub仓库中的音乐文件
 */

class GitHubAPI {
    /**
     * 初始化GitHub API客户端
     * @param {string} baseUrl - GitHub API基本URL
     */
    constructor(baseUrl = 'https://api.github.com') {
        this.baseUrl = baseUrl;
        this.repo = '';
    }

    /**
     * 设置要访问的仓库
     * @param {string} repo - 仓库路径 (username/repo)
     */
    setRepository(repo) {
        this.repo = repo;
    }

    /**
     * 获取仓库内容
     * @param {string} path - 仓库中的路径
     * @returns {Promise<Array>} - 返回文件列表
     */
    async getContents(path = '') {
        if (!this.repo) {
            throw new Error('仓库未设置');
        }

        try {
            const url = `${this.baseUrl}/repos/${this.repo}/contents/${path}`;
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    return []; // 路径不存在，返回空数组
                }
                throw new Error(`GitHub API请求失败: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error('获取GitHub仓库内容出错:', error);
            throw error;
        }
    }

    /**
     * 获取文件原始内容的URL
     * @param {string} path - 文件路径
     * @returns {string} - 原始内容URL
     */
    getRawContentUrl(path) {
        return `https://raw.githubusercontent.com/${this.repo}/master/${path}`;
    }

    /**
     * 获取仓库中所有音乐文件
     * @returns {Promise<Array>} - 音乐文件列表
     */
    async getAllMusicFiles() {
        try {
            // 这里可以实现递归获取所有文件夹中的音乐文件
            // 此示例仅获取根目录的音乐文件
            const contents = await this.getContents('');
            return contents.filter(item => 
                item.type === 'file' && item.name.endsWith('.mp3')
            );
        } catch (error) {
            console.error('获取音乐文件列表出错:', error);
            throw error;
        }
    }

    /**
     * 将GitHub文件转换为音轨对象
     * @param {Object} file - GitHub API返回的文件对象
     * @returns {Object} - 音轨对象
     */
    fileToTrack(file) {
        const fileName = file.name.replace('.mp3', '');
        let title = fileName;
        let artist = 'Unknown';
        
        // 尝试从文件名解析歌手和标题
        if (fileName.includes('-')) {
            const parts = fileName.split('-');
            title = parts[0].trim();
            artist = parts.slice(1).join('-').trim();
        }
        
        return {
            title,
            artist,
            url: this.getRawContentUrl(file.path),
            cover: this.getRawContentUrl(file.path.replace('.mp3', '.jpg')),
            lrc: this.getRawContentUrl(file.path.replace('.mp3', '.lrc'))
        };
    }
}

// 导出GitHub API客户端
const githubApi = new GitHubAPI(CONFIG?.api?.github?.baseUrl || 'https://api.github.com');
if (CONFIG?.api?.github?.repo) {
    githubApi.setRepository(CONFIG.api.github.repo);
} 
/**
 * 代码仓库 API 访问模块
 * 用于访问GitHub/Gitee仓库中的音乐文件
 */

/**
 * 基础仓库API类
 */
class BaseRepoAPI {
    /**
     * 初始化基础仓库 API客户端
     * @param {string} baseUrl - API基本URL
     */
    constructor(baseUrl) {
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
            const url = this.buildContentsUrl(path);
            
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    return []; // 路径不存在，返回空数组
                }
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error(`获取仓库内容出错:`, error);
            throw error;
        }
    }

    /**
     * 构建API内容URL (由子类实现)
     * @param {string} path - 仓库路径
     * @returns {string} - API URL
     */
    buildContentsUrl(path) {
        throw new Error('需要由子类实现');
    }

    /**
     * 获取文件原始内容的URL (由子类实现)
     * @param {string} path - 文件路径
     * @returns {string} - 原始内容URL
     */
    getRawContentUrl(path) {
        throw new Error('需要由子类实现');
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
     * 将仓库文件转换为音轨对象
     * @param {Object} file - API返回的文件对象
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
        
        // 优先使用API返回的download_url
        const audioUrl = file.download_url || this.getRawContentUrl(file.path);
        
        // 构建封面和歌词URL
        let coverUrl, lrcUrl;
        
        if (file.download_url) {
            // 如果有download_url，使用相同的模式构建封面和歌词URL
            coverUrl = file.download_url.replace('.mp3', '.jpg');
            lrcUrl = file.download_url.replace('.mp3', '.lrc');
        } else {
            // 否则使用getRawContentUrl方法
            coverUrl = this.getRawContentUrl(file.path.replace('.mp3', '.jpg'));
            lrcUrl = this.getRawContentUrl(file.path.replace('.mp3', '.lrc'));
        }
        
        return {
            title,
            artist,
            url: audioUrl,
            cover: coverUrl,
            lrc: lrcUrl
        };
    }
}

/**
 * GitHub API 客户端
 */
class GitHubAPI extends BaseRepoAPI {
    /**
     * 初始化GitHub API客户端
     * @param {string} baseUrl - API基础URL (可选)
     */
    constructor(baseUrl = 'https://api.github.com') {
        super(baseUrl);
        this.platform = 'github';
    }

    /**
     * 构建GitHub API内容URL
     * @param {string} path - 仓库路径
     * @returns {string} - API URL
     */
    buildContentsUrl(path) {
        return `${this.baseUrl}/repos/${this.repo}/contents/${path}`;
    }

    /**
     * 获取GitHub文件原始内容的URL
     * @param {string} path - 文件路径
     * @returns {string} - 原始内容URL
     */
    getRawContentUrl(path) {
        return `https://raw.githubusercontent.com/${this.repo}/master/${path}`;
    }
}

/**
 * Gitee API 客户端
 */
class GiteeAPI extends BaseRepoAPI {
    /**
     * 初始化Gitee API客户端
     * @param {string} baseUrl - API基础URL (可选)
     */
    constructor(baseUrl = 'https://gitee.com/api/v5') {
        super(baseUrl);
        this.platform = 'gitee';
    }

    /**
     * 构建Gitee API内容URL
     * @param {string} path - 仓库路径
     * @returns {string} - API URL
     */
    buildContentsUrl(path) {
        const [owner, repo] = this.repo.split('/');
        return `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    }

    /**
     * 获取Gitee文件原始内容的URL
     * @param {string} path - 文件路径
     * @returns {string} - 原始内容URL
     */
    getRawContentUrl(path) {
        return `https://gitee.com/${this.repo}/raw/master/${path}`;
    }
}

// 兼容原有代码的RepoAPI类
class RepoAPI {
    constructor(platform = 'github', baseUrl = null) {
        if (platform.toLowerCase() === 'github') {
            return new GitHubAPI(baseUrl);
        } else {
            return new GiteeAPI(baseUrl);
        }
    }
}

// 导出GitHub API客户端
const githubApi = new GitHubAPI(CONFIG?.api?.github?.baseUrl);
if (CONFIG?.api?.github?.repo) {
    githubApi.setRepository(CONFIG.api.github.repo);
}

// 导出Gitee API客户端
const giteeApi = new GiteeAPI(CONFIG?.api?.gitee?.baseUrl);
if (CONFIG?.api?.gitee?.repo) {
    giteeApi.setRepository(CONFIG.api.gitee.repo);
} 
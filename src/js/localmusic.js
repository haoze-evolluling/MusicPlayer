/**
 * 本地音乐访问模块
 * 用于访问本地音乐文件
 */

class LocalMusicAPI {
    /**
     * 初始化本地音乐API客户端
     */
    constructor() {
        this.supportedFormats = ['.mp3', '.wav', '.ogg', '.flac']; // 支持的音频格式
        this.musicFiles = []; // 存储找到的音乐文件
        this.currentPath = ''; // 当前浏览的路径
        this.isElectron = typeof window !== 'undefined' && 
                         window.navigator && 
                         window.navigator.userAgent && 
                         window.navigator.userAgent.indexOf('Electron') >= 0;
    }

    /**
     * 检查文件是否为支持的音频格式
     * @param {string} filename - 文件名
     * @returns {boolean} - 是否支持
     */
    isSupportedAudio(filename) {
        return this.supportedFormats.some(format => 
            filename.toLowerCase().endsWith(format)
        );
    }

    /**
     * 获取指定目录的内容
     * @param {string} path - 目录路径
     * @returns {Promise<Array>} - 返回文件和文件夹列表
     */
    async getContents(path = '') {
        try {
            // 使用文件系统API获取文件列表
            this.currentPath = path;
            
            // Electron环境使用Node.js的fs模块
            if (this.isElectron && window.electron) {
                return await this.getElectronContents(path);
            } 
            // Web环境使用File System Access API
            else {
                return await this.getWebContents(path);
            }
        } catch (error) {
            console.error('获取本地文件列表出错:', error);
            throw error;
        }
    }
    
    /**
     * 在Electron环境中获取目录内容
     * @param {string} path - 目录路径
     * @returns {Promise<Array>} - 文件列表
     */
    async getElectronContents(path) {
        try {
            if (!window.electron || !window.electron.localFiles) {
                console.error('Electron API不可用');
                throw new Error('Electron API不可用');
            }
            
            const musicDir = window.electron.localFiles.musicDir;
            if (!musicDir) {
                console.error('未设置音乐文件夹路径');
                throw new Error('请先选择音乐文件夹');
            }
            
            // 构建完整路径
            let fullPath;
            if (path) {
                fullPath = path.startsWith(musicDir) ? path : `${musicDir}/${path}`;
            } else {
                fullPath = musicDir;
            }
            
            console.log('正在读取目录:', fullPath);
            
            // 使用Electron的IPC通信获取文件列表
            const files = await window.electron.localFiles.readDir(fullPath);
            console.log(`读取到 ${files.length} 个文件/文件夹`);
            
            // 转换为统一格式
            return files.map(file => ({
                name: file.name,
                path: file.path.replace(/\\/g, '/'), // 统一使用正斜杠
                type: file.isDirectory ? 'dir' : 'file',
                size: file.size,
                // 在Electron中，我们直接使用文件路径
                handle: file.path
            }));
        } catch (error) {
            console.error('Electron读取目录失败:', error);
            throw error;
        }
    }
    
    /**
     * 在Web环境中获取目录内容
     * @param {string} path - 目录路径
     * @returns {Promise<Array>} - 文件列表
     */
    async getWebContents(path) {
        if (!window.directoryHandle) {
            throw new Error('请先选择音乐文件夹');
        }
        
        let handle = window.directoryHandle;
        
        // 如果path不为空，需要导航到子文件夹
        if (path) {
            const pathParts = path.split('/').filter(p => p);
            for (const part of pathParts) {
                handle = await handle.getDirectoryHandle(part);
            }
        }
        
        const entries = [];
        
        // 遍历目录中的所有条目
        for await (const [name, entryHandle] of handle.entries()) {
            const isDirectory = entryHandle.kind === 'directory';
            entries.push({
                name,
                path: path ? `${path}/${name}` : name,
                type: isDirectory ? 'dir' : 'file',
                handle: entryHandle
            });
        }
        
        // 对结果进行排序：先文件夹，再按名称字母顺序
        return entries.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'dir' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * 转换文件对象为音轨对象
     * @param {Object} file - 文件对象
     * @returns {Promise<Object>} - 音轨对象
     */
    async fileToTrack(file) {
        const fileName = file.name.replace(/\.[^.]+$/, ''); // 移除扩展名
        let title = fileName;
        let artist = 'Unknown';
        
        // 尝试从文件名解析歌手和标题
        if (fileName.includes('-')) {
            const parts = fileName.split('-');
            artist = parts[0].trim();
            title = parts.slice(1).join('-').trim();
        }
        
        let fileUrl, lrcUrl, coverUrl;
        
        // Electron环境
        if (this.isElectron && window.electron) {
            // 在Electron中，我们可以直接使用文件路径
            fileUrl = file.handle; // 在Electron中，handle就是文件路径
            
            // 查找同名的歌词文件和封面文件
            const directoryPath = file.path.substring(0, file.path.lastIndexOf('/') + 1) || '';
            const siblingFiles = await this.getContents(directoryPath);
            
            // 查找同名的歌词文件
            const lrcFile = siblingFiles.find(f => 
                f.name === `${fileName}.lrc` || 
                f.name === file.name.replace(/\.[^.]+$/, '.lrc')
            );
            
            if (lrcFile) {
                lrcUrl = lrcFile.handle; // 在Electron中，handle就是文件路径
            }
            
            // 查找同名的封面文件
            const coverFile = siblingFiles.find(f => {
                const lower = f.name.toLowerCase();
                return (lower === `${fileName.toLowerCase()}.jpg` || 
                       lower === `${fileName.toLowerCase()}.png` ||
                       lower === file.name.toLowerCase().replace(/\.[^.]+$/, '.jpg') ||
                       lower === file.name.toLowerCase().replace(/\.[^.]+$/, '.png'));
            });
            
            if (coverFile) {
                coverUrl = coverFile.handle; // 在Electron中，handle就是文件路径
            }
        } 
        // Web环境
        else {
            // 获取文件URL
            const fileHandle = file.handle;
            const fileObj = await fileHandle.getFile();
            fileUrl = URL.createObjectURL(fileObj);
            
            try {
                // 获取同一目录下的所有文件
                const directoryPath = file.path.substring(0, file.path.lastIndexOf('/') + 1) || '';
                const siblingFiles = await this.getContents(directoryPath);
                
                // 查找同名的歌词文件
                const lrcFile = siblingFiles.find(f => 
                    f.name === `${fileName}.lrc` || 
                    f.name === file.name.replace(/\.[^.]+$/, '.lrc')
                );
                
                if (lrcFile) {
                    const lrcFileObj = await lrcFile.handle.getFile();
                    lrcUrl = URL.createObjectURL(lrcFileObj);
                }
                
                // 查找同名的封面文件
                const coverFile = siblingFiles.find(f => {
                    const lower = f.name.toLowerCase();
                    return (lower === `${fileName.toLowerCase()}.jpg` || 
                           lower === `${fileName.toLowerCase()}.png` ||
                           lower === file.name.toLowerCase().replace(/\.[^.]+$/, '.jpg') ||
                           lower === file.name.toLowerCase().replace(/\.[^.]+$/, '.png'));
                });
                
                if (coverFile) {
                    const coverFileObj = await coverFile.handle.getFile();
                    coverUrl = URL.createObjectURL(coverFileObj);
                }
            } catch (error) {
                console.warn('查找关联文件时出错:', error);
                // 继续执行，即使没有找到关联文件
            }
        }
        
        return {
            title,
            artist,
            url: fileUrl,
            cover: coverUrl || './assets/default-cover.png',
            lrc: lrcUrl
        };
    }

    /**
     * 选择本地音乐文件夹
     * @returns {Promise<boolean>} - 是否成功选择文件夹
     */
    async selectMusicFolder() {
        try {
            // Electron环境
            if (this.isElectron && window.electron) {
                // 使用Electron的对话框API选择文件夹
                const result = await window.electron.dialog.selectDirectory();
                
                // 检查用户是否取消了选择
                if (result.canceled) {
                    console.log('用户取消了文件夹选择');
                    return false;
                }
                
                if (result.filePaths && result.filePaths.length > 0) {
                    // 存储选择的目录路径
                    window.electron.localFiles.musicDir = result.filePaths[0];
                    console.log('已选择音乐文件夹:', result.filePaths[0]);
                    return true;
                }
                return false;
            } 
            // Web环境
            else {
                // 请求用户选择文件夹
                const dirHandle = await window.showDirectoryPicker({
                    id: 'musicFolder',
                    startIn: 'music',
                    mode: 'read'
                });
                
                // 存储文件夹句柄以便后续访问
                window.directoryHandle = dirHandle;
                
                // 返回成功
                return true;
            }
        } catch (error) {
            console.error('选择文件夹失败:', error);
            return false;
        }
    }

    /**
     * 检查是否已选择音乐文件夹
     * @returns {boolean} - 是否已选择文件夹
     */
    hasMusicFolderSelected() {
        // Electron环境
        if (this.isElectron && window.electron) {
            return !!window.electron.localFiles.musicDir;
        } 
        // Web环境
        else {
            return !!window.directoryHandle;
        }
    }
}

// 导出本地音乐API客户端
const localMusicApi = new LocalMusicAPI(); 
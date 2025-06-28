/**
 * 箜篌音乐播放器配置文件
 */

const CONFIG = {
    // API相关配置
    api: {
        github: {
            baseUrl: 'https://api.github.com',
            repo: 'haoze-evolluling/MusicStorage' // GitHub音乐仓库
        },
        gitee: {
            baseUrl: 'https://gitee.com/api/v5',
            repo: 'your-username/music-repo' // 替换为您的Gitee音乐仓库
        }
    },
    
    // 播放器默认设置
    player: {
        defaultVolume: 0.8, // 默认音量 (0-1)
        defaultSpeed: 1.0,  // 默认速度
        loopMode: 'list',   // 默认循环模式: 'list', 'single', 'random'
    },
    
    // 背景设置
    background: {
        defaultType: 'default', // 默认背景: 'default', 'cover', 'custom'
        blurLevel: 30, // 背景模糊程度
    },
    
    // 存储相关键名
    storage: {
        volume: 'konghou_volume',
        playMode: 'konghou_play_mode',
        playbackSpeed: 'konghou_speed',
        background: 'konghou_background',
        customBg: 'konghou_custom_bg',
        playHistory: 'konghou_history',
        lastPlaylist: 'konghou_last_playlist'
    }
}; 
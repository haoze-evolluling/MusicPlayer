/**
 * 箜篌音乐播放器配置文件
 */

const CONFIG = {
    // API相关配置
    api: {
        github: {
            baseUrl: 'https://api.github.com',
            repo: 'haoze-evolluling/MusicStorage', // 默认GitHub音乐仓库
            defaultRepo: 'haoze-evolluling/MusicStorage' // 默认GitHub音乐仓库（用于重置）
        },
        gitee: {
            baseUrl: 'https://gitee.com/api/v5',
            repo: 'your-username/music-repo', // 默认Gitee音乐仓库
            defaultRepo: 'your-username/music-repo' // 默认Gitee音乐仓库（用于重置）
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
    },
    
    // 存储相关键名
    storage: {
        volume: 'konghou_volume',
        playMode: 'konghou_play_mode',
        playbackSpeed: 'konghou_speed',
        background: 'konghou_background',
        customBg: 'konghou_custom_bg',
        playHistory: 'konghou_history',
        lastPlaylist: 'konghou_last_playlist',
        githubRepo: 'konghou_github_repo',
        giteeRepo: 'konghou_gitee_repo'
    }
}; 
/**
 * 箜篌音乐播放器配置文件
 */

const CONFIG = {
    // API相关配置
    api: {
        github: {
            baseUrl: 'https://api.github.com',
            repo: 'haoze-evolluling/MusicStorage',
            defaultRepo: 'haoze-evolluling/MusicStorage'
        },
        gitee: {
            baseUrl: 'https://gitee.com/api/v5',
            repo: 'haozelee/MusicStorage',
            defaultRepo: 'haozelee/MusicStorage'
        },
        local: {
            supportedFormats: ['.mp3', '.wav', '.ogg', '.flac']
        }
    },
    
    // 播放器默认设置
    player: {
        defaultVolume: 0.8,
        defaultSpeed: 1.0,
        loopMode: 'list',
    },
    
    // 背景设置
    background: {
        defaultType: 'default',
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
        giteeRepo: 'konghou_gitee_repo',
        lastLocalFolder: 'konghou_local_folder'
    }
}; 
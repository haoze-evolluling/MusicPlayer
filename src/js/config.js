/**
 * 箜篌音乐播放器配置文件
 */

const CONFIG = {
    // API相关配置
    api: {
        github: {
            baseUrl: 'https://api.github.com',
            repo: 'your-username/music-repo' // 替换为您的GitHub音乐仓库
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
        defaultType: 'particles', // 默认背景: 'particles', 'cover', 'custom'
        blurLevel: 30, // 背景模糊程度
        particlesOptions: {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ffffff"
                },
                shape: {
                    type: "circle",
                },
                opacity: {
                    value: 0.5,
                    random: true,
                },
                size: {
                    value: 3,
                    random: true,
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        }
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
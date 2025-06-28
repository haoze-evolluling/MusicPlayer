/**
 * 示例数据，用于演示和测试
 */

const DEMO_DATA = {
    playlists: [
        {
            id: 'demo_chinese',
            name: '华语示例',
            cover: './assets/playlist-covers/chinese.jpg',
            tracks: [
                {
                    title: '示例歌曲1',
                    artist: '示例歌手1',
                    url: 'https://example.com/music/sample1.mp3',
                    cover: './assets/default-cover.png',
                    lrc: 'https://example.com/music/sample1.lrc'
                },
                {
                    title: '示例歌曲2',
                    artist: '示例歌手2',
                    url: 'https://example.com/music/sample2.mp3',
                    cover: './assets/default-cover.png',
                    lrc: 'https://example.com/music/sample2.lrc'
                }
            ]
        },
        {
            id: 'demo_western',
            name: '欧美示例',
            cover: './assets/playlist-covers/western.jpg',
            tracks: [
                {
                    title: 'Sample Song 1',
                    artist: 'Sample Artist 1',
                    url: 'https://example.com/music/western1.mp3',
                    cover: './assets/default-cover.png',
                    lrc: 'https://example.com/music/western1.lrc'
                },
                {
                    title: 'Sample Song 2',
                    artist: 'Sample Artist 2',
                    url: 'https://example.com/music/western2.mp3',
                    cover: './assets/default-cover.png',
                    lrc: 'https://example.com/music/western2.lrc'
                }
            ]
        }
    ],
    
    // 示例歌词
    sampleLyric: `[ti:示例歌词]
[ar:箜篌]
[al:示例专辑]
[by:箜篌播放器]
[00:00.00]这是一个示例歌词
[00:03.50]用于测试歌词显示功能
[00:07.20]歌词会随着音乐播放自动滚动
[00:11.50]高亮显示当前播放的歌词行
[00:15.30]支持翻译歌词功能
[00:19.80]也可以切换到全屏模式
[00:23.50]感谢使用箜篌音乐播放器
[00:27.00]祝您使用愉快！`,
    
    // 示例翻译歌词
    sampleLyricWithTranslation: `[ti:Sample Lyrics]
[ar:Konghou]
[al:Sample Album]
[by:Konghou Player]
[00:00.00]This is a sample lyric|这是一个示例歌词
[00:03.50]Used to test the lyrics display function|用于测试歌词显示功能
[00:07.20]Lyrics will scroll automatically with music playback|歌词会随着音乐播放自动滚动
[00:11.50]Highlighting the currently playing lyric line|高亮显示当前播放的歌词行
[00:15.30]Support for translated lyrics|支持翻译歌词功能
[00:19.80]Can also switch to full screen mode|也可以切换到全屏模式
[00:23.50]Thank you for using Konghou Music Player|感谢使用箜篌音乐播放器
[00:27.00]Have a pleasant experience!|祝您使用愉快！`,
    
    // 示例搜索结果
    searchResults: {
        "github": [
            {
                title: "测试歌曲1",
                artist: "测试歌手1",
                url: "https://example.com/music/test1.mp3",
                cover: "./assets/default-cover.png",
                lrc: "https://example.com/music/test1.lrc"
            },
            {
                title: "测试歌曲2",
                artist: "测试歌手2",
                url: "https://example.com/music/test2.mp3",
                cover: "./assets/default-cover.png",
                lrc: "https://example.com/music/test2.lrc"
            }
        ],
        "gitee": [
            {
                title: "Gitee测试1",
                artist: "测试艺术家1",
                url: "https://example.com/music/gitee1.mp3",
                cover: "./assets/default-cover.png",
                lrc: "https://example.com/music/gitee1.lrc"
            },
            {
                title: "Gitee测试2",
                artist: "测试艺术家2",
                url: "https://example.com/music/gitee2.mp3",
                cover: "./assets/default-cover.png",
                lrc: "https://example.com/music/gitee2.lrc"
            }
        ]
    }
}; 
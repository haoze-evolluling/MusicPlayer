/**
 * 播放列表管理模块
 */

class PlaylistManager {
    constructor() {
        this.container = document.querySelector('.playlist-grid');
        this.playlists = [];
        
        this.init();
    }
    
    init() {
        // 加载示例播放列表
        this.loadSamplePlaylists();
        this.renderPlaylists();
    }
    
    loadSamplePlaylists() {
        // 这里只是示例数据，实际应用中可以从本地存储或远程API获取
        this.playlists = [
            {
                id: 'favorites',
                name: '我喜欢的音乐',
                cover: './assets/playlist-covers/favorites.jpg',
                tracks: [] // 将从历史记录中加载
            },
            {
                id: 'history',
                name: '最近播放',
                cover: './assets/playlist-covers/history.jpg',
                tracks: [] // 将从历史记录中加载
            },
            {
                id: 'chinese',
                name: '华语经典',
                cover: './assets/playlist-covers/chinese.jpg',
                tracks: [
                    {
                        title: '示例歌曲1',
                        artist: '示例歌手1',
                        url: '#',
                        cover: './assets/default-cover.png',
                        lrc: '#'
                    },
                    {
                        title: '示例歌曲2',
                        artist: '示例歌手2',
                        url: '#',
                        cover: './assets/default-cover.png',
                        lrc: '#'
                    }
                ]
            },
            {
                id: 'western',
                name: '欧美流行',
                cover: './assets/playlist-covers/western.jpg',
                tracks: [
                    {
                        title: 'Sample Song 1',
                        artist: 'Sample Artist 1',
                        url: '#',
                        cover: './assets/default-cover.png',
                        lrc: '#'
                    },
                    {
                        title: 'Sample Song 2',
                        artist: 'Sample Artist 2',
                        url: '#',
                        cover: './assets/default-cover.png',
                        lrc: '#'
                    }
                ]
            }
        ];
    }
    
    renderPlaylists() {
        let html = '';
        
        this.playlists.forEach(playlist => {
            html += `
                <div class="playlist-item" data-id="${playlist.id}">
                    <div class="playlist-cover">
                        <img src="${playlist.cover}" alt="${playlist.name}">
                    </div>
                    <div class="playlist-name">${playlist.name}</div>
                </div>
            `;
        });
        
        this.container.innerHTML = html;
        
        // 绑定点击事件
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const playlistId = item.dataset.id;
                this.loadPlaylist(playlistId);
            });
        });
    }
    
    loadPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        // 特殊处理历史记录和收藏夹
        if (playlistId === 'history') {
            this.loadHistoryPlaylist();
        } else if (playlistId === 'favorites') {
            this.loadFavoritesPlaylist();
        } else if (playlist.tracks && playlist.tracks.length > 0) {
            // 加载普通播放列表
            musicPlayer.setPlaylist(playlist.tracks);
            
            // 切换到"正在播放"标签页
            document.querySelector('.tab-btn[data-tab="now-playing"]').click();
        }
    }
    
    loadHistoryPlaylist() {
        try {
            const history = JSON.parse(localStorage.getItem(CONFIG.storage.playHistory) || '[]');
            
            if (history.length === 0) {
                layer.msg('播放历史为空');
                return;
            }
            
            musicPlayer.setPlaylist(history);
            
            // 切换到"正在播放"标签页
            document.querySelector('.tab-btn[data-tab="now-playing"]').click();
        } catch (error) {
            console.error('加载播放历史出错:', error);
            layer.msg('加载播放历史失败');
        }
    }
    
    loadFavoritesPlaylist() {
        try {
            const favorites = JSON.parse(localStorage.getItem('konghou_favorites') || '[]');
            
            if (favorites.length === 0) {
                layer.msg('收藏列表为空');
                return;
            }
            
            musicPlayer.setPlaylist(favorites);
            
            // 切换到"正在播放"标签页
            document.querySelector('.tab-btn[data-tab="now-playing"]').click();
        } catch (error) {
            console.error('加载收藏列表出错:', error);
            layer.msg('加载收藏列表失败');
        }
    }
    
    // 添加歌曲到收藏夹
    addToFavorites(track) {
        try {
            let favorites = JSON.parse(localStorage.getItem('konghou_favorites') || '[]');
            
            // 检查是否已经在收藏夹中
            const exists = favorites.some(item => item.url === track.url);
            
            if (!exists) {
                favorites.push(track);
                localStorage.setItem('konghou_favorites', JSON.stringify(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('添加到收藏夹出错:', error);
            return false;
        }
    }
    
    // 从收藏夹移除歌曲
    removeFromFavorites(track) {
        try {
            let favorites = JSON.parse(localStorage.getItem('konghou_favorites') || '[]');
            favorites = favorites.filter(item => item.url !== track.url);
            localStorage.setItem('konghou_favorites', JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.error('从收藏夹移除出错:', error);
            return false;
        }
    }
    
    // 检查歌曲是否在收藏夹中
    isInFavorites(track) {
        try {
            const favorites = JSON.parse(localStorage.getItem('konghou_favorites') || '[]');
            return favorites.some(item => item.url === track.url);
        } catch (error) {
            console.error('检查收藏状态出错:', error);
            return false;
        }
    }
    
    // 添加自定义播放列表
    addCustomPlaylist(name, tracks = []) {
        const id = 'custom_' + Date.now();
        const playlist = {
            id,
            name,
            cover: './assets/playlist-covers/custom.jpg',
            tracks
        };
        
        this.playlists.push(playlist);
        this.savePlaylists();
        this.renderPlaylists();
    }
    
    // 保存播放列表到本地存储
    savePlaylists() {
        try {
            // 只保存自定义播放列表
            const customPlaylists = this.playlists.filter(p => p.id.startsWith('custom_'));
            localStorage.setItem('konghou_playlists', JSON.stringify(customPlaylists));
        } catch (error) {
            console.error('保存播放列表出错:', error);
        }
    }
}

// 全局播放列表管理器实例
const playlistManager = new PlaylistManager(); 
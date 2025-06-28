/**
 * 音乐播放器核心模块
 */

class MusicPlayer {
    constructor() {
        // 音频元素
        this.audio = document.getElementById('audio-player');
        
        // UI元素
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.loopBtn = document.getElementById('loop-btn');
        this.muteBtn = document.getElementById('mute-btn');
        this.speedSelect = document.getElementById('speed-select');
        this.progressBar = document.querySelector('.progress-bar');
        this.progress = document.querySelector('.progress');
        this.volumeBar = document.querySelector('.volume-bar');
        this.volumeLevel = document.querySelector('.volume-level');
        this.currentTimeElem = document.getElementById('current-time');
        this.totalTimeElem = document.getElementById('total-time');
        this.albumCoverElem = document.getElementById('current-cover');
        this.currentTitleElem = document.getElementById('current-title');
        this.currentArtistElem = document.getElementById('current-artist');
        
        // 播放状态
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.playlist = [];
        this.loopMode = localStorage.getItem(CONFIG.storage.playMode) || CONFIG.player.loopMode;
        
        // 初始化
        this.initPlayer();
        this.bindEvents();
    }
    
    initPlayer() {
        // 设置初始音量
        this.audio.volume = parseFloat(localStorage.getItem(CONFIG.storage.volume)) || CONFIG.player.defaultVolume;
        this.updateVolumeUI();
        
        // 设置初始播放速度
        const savedSpeed = localStorage.getItem(CONFIG.storage.playbackSpeed) || CONFIG.player.defaultSpeed;
        this.audio.playbackRate = parseFloat(savedSpeed);
        this.speedSelect.value = savedSpeed;
        
        // 设置循环模式
        this.updateLoopModeUI();
        
        // 加载上次播放的列表（如果有）
        this.loadLastPlaylist();
    }
    
    bindEvents() {
        // 播放/暂停按钮
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        // 上一首/下一首按钮
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        
        // 循环模式按钮
        this.loopBtn.addEventListener('click', () => this.toggleLoopMode());
        
        // 静音按钮
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // 播放速度选择
        this.speedSelect.addEventListener('change', () => {
            const speed = parseFloat(this.speedSelect.value);
            this.setPlaybackSpeed(speed);
        });
        
        // 进度条
        this.progressBar.addEventListener('click', (e) => {
            const percent = e.offsetX / this.progressBar.offsetWidth;
            this.audio.currentTime = percent * this.audio.duration;
        });
        
        // 音量条
        this.volumeBar.addEventListener('click', (e) => {
            const volume = e.offsetX / this.volumeBar.offsetWidth;
            this.setVolume(volume);
        });
        
        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateTotalTime();
            this.albumCoverElem.classList.add('playing');
        });
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.playBtn.querySelector('img').src = './assets/pause.svg';
            this.albumCoverElem.classList.add('playing');
        });
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.playBtn.querySelector('img').src = './assets/play.svg';
            this.albumCoverElem.classList.remove('playing');
        });
    }
    
    loadLastPlaylist() {
        try {
            const savedPlaylist = localStorage.getItem(CONFIG.storage.lastPlaylist);
            const savedIndex = localStorage.getItem('konghou_last_index');
            
            if (savedPlaylist) {
                this.playlist = JSON.parse(savedPlaylist);
                this.currentTrackIndex = parseInt(savedIndex) || 0;
                
                if (this.playlist.length > 0) {
                    this.updateCurrentTrackInfo();
                    this.renderPlaylist();
                }
            }
        } catch (error) {
            console.error('加载上次播放列表出错:', error);
        }
    }
    
    setPlaylist(playlist, startIndex = 0) {
        this.playlist = playlist;
        this.currentTrackIndex = startIndex;
        
        // 保存播放列表
        localStorage.setItem(CONFIG.storage.lastPlaylist, JSON.stringify(this.playlist));
        localStorage.setItem('konghou_last_index', this.currentTrackIndex);
        
        this.renderPlaylist();
        this.updateCurrentTrackInfo();
        this.play();
    }
    
    renderPlaylist() {
        const playlistElem = document.querySelector('.current-playlist');
        playlistElem.innerHTML = '';
        
        this.playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = index === this.currentTrackIndex ? 'active' : '';
            li.innerHTML = `
                <span>${track.title}</span>
                <span>${track.artist}</span>
            `;
            li.addEventListener('click', () => {
                this.currentTrackIndex = index;
                this.updateCurrentTrackInfo();
                this.play();
            });
            
            playlistElem.appendChild(li);
        });
    }
    
    updateCurrentTrackInfo() {
        if (this.playlist.length === 0 || !this.playlist[this.currentTrackIndex]) {
            return;
        }
        
        const currentTrack = this.playlist[this.currentTrackIndex];
        
        // 更新UI
        this.currentTitleElem.textContent = currentTrack.title;
        this.currentArtistElem.textContent = currentTrack.artist;
        
        // 更新封面
        if (currentTrack.cover) {
            this.albumCoverElem.src = currentTrack.cover;
            // 如果背景模式为封面，则更新背景
            backgroundManager.setCoverBackground(currentTrack.cover);
        } else {
            this.albumCoverElem.src = './assets/default-cover.png';
        }
        
        // 更新音频源
        this.audio.src = currentTrack.url;
        
        // 更新歌词
        if (lyricsManager) {
            lyricsManager.loadLyrics(currentTrack.lrc);
        }
        
        // 高亮当前播放的歌曲
        document.querySelectorAll('.current-playlist li').forEach((li, index) => {
            li.classList.toggle('active', index === this.currentTrackIndex);
        });
        
        // 保存播放历史
        this.saveToHistory(currentTrack);
    }
    
    saveToHistory(track) {
        try {
            let history = JSON.parse(localStorage.getItem(CONFIG.storage.playHistory) || '[]');
            
            // 避免重复，先移除相同的歌曲
            history = history.filter(item => item.url !== track.url);
            
            // 添加到历史开头
            history.unshift(track);
            
            // 限制历史记录数量
            if (history.length > 50) {
                history = history.slice(0, 50);
            }
            
            localStorage.setItem(CONFIG.storage.playHistory, JSON.stringify(history));
        } catch (error) {
            console.error('保存播放历史出错:', error);
        }
    }
    
    play() {
        if (this.playlist.length === 0) return;
        
        this.updateCurrentTrackInfo();
        this.audio.play().catch(err => console.error('播放失败:', err));
    }
    
    pause() {
        this.audio.pause();
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    playPrevious() {
        if (this.playlist.length <= 1) return;
        
        if (this.loopMode === 'random') {
            this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        }
        
        localStorage.setItem('konghou_last_index', this.currentTrackIndex);
        this.updateCurrentTrackInfo();
        this.play();
    }
    
    playNext() {
        if (this.playlist.length <= 1) return;
        
        if (this.loopMode === 'random') {
            this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        }
        
        localStorage.setItem('konghou_last_index', this.currentTrackIndex);
        this.updateCurrentTrackInfo();
        this.play();
    }
    
    toggleLoopMode() {
        switch (this.loopMode) {
            case 'list':
                this.loopMode = 'single';
                break;
            case 'single':
                this.loopMode = 'random';
                break;
            case 'random':
                this.loopMode = 'list';
                break;
        }
        
        localStorage.setItem(CONFIG.storage.playMode, this.loopMode);
        this.updateLoopModeUI();
    }
    
    updateLoopModeUI() {
        const loopBtnImg = this.loopBtn.querySelector('img');
        
        switch (this.loopMode) {
            case 'list':
                loopBtnImg.src = './assets/repeat.svg';
                this.loopBtn.title = '列表循环';
                break;
            case 'single':
                loopBtnImg.src = './assets/repeat-one.svg';
                this.loopBtn.title = '单曲循环';
                break;
            case 'random':
                loopBtnImg.src = './assets/shuffle.svg';
                this.loopBtn.title = '随机播放';
                break;
        }
    }
    
    handleTrackEnd() {
        if (this.loopMode === 'single') {
            this.audio.currentTime = 0;
            this.play();
        } else {
            this.playNext();
        }
    }
    
    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.muteBtn.querySelector('img').src = this.audio.muted ? 
            './assets/volume-mute.svg' : 
            (this.audio.volume < 0.5 ? './assets/volume-low.svg' : './assets/volume.svg');
    }
    
    setVolume(volume) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
        this.audio.muted = false;
        localStorage.setItem(CONFIG.storage.volume, this.audio.volume);
        this.updateVolumeUI();
    }
    
    updateVolumeUI() {
        this.volumeLevel.style.width = `${this.audio.volume * 100}%`;
        
        // 更新音量图标
        const volumeIcon = this.muteBtn.querySelector('img');
        if (this.audio.muted) {
            volumeIcon.src = './assets/volume-mute.svg';
        } else if (this.audio.volume < 0.5) {
            volumeIcon.src = './assets/volume-low.svg';
        } else {
            volumeIcon.src = './assets/volume.svg';
        }
    }
    
    setPlaybackSpeed(speed) {
        this.audio.playbackRate = speed;
        localStorage.setItem(CONFIG.storage.playbackSpeed, speed);
    }
    
    updateProgress() {
        if (isNaN(this.audio.duration)) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.style.width = `${percent}%`;
        
        // 更新当前时间
        this.updateCurrentTime();
        
        // 更新歌词
        if (lyricsManager) {
            lyricsManager.updateActiveLyric(this.audio.currentTime);
        }
    }
    
    updateCurrentTime() {
        const currentTime = this.formatTime(this.audio.currentTime);
        this.currentTimeElem.textContent = currentTime;
    }
    
    updateTotalTime() {
        const totalTime = this.formatTime(this.audio.duration);
        this.totalTimeElem.textContent = totalTime;
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// 全局播放器实例
const musicPlayer = new MusicPlayer(); 
/**
 * 歌词管理模块
 */

class LyricsManager {
    constructor() {
        this.lyricsContent = document.querySelector('.lyrics-content');
        this.fullscreenLyricsContent = document.querySelector('.fullscreen-lyrics-content');
        this.lyricsWrapper = document.querySelector('.lyrics-wrapper');
        this.container = document.querySelector('.lyrics-container');
        this.toggleTransBtn = document.getElementById('toggle-translation');
        this.toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
        this.hideLyricsBtn = document.getElementById('hide-lyrics');
        this.exitFullscreenBtn = document.getElementById('exit-fullscreen');
        this.fullscreenOverlay = document.getElementById('fullscreen-lyrics');
        
        this.lyrics = [];
        this.translations = [];
        this.activeLyricIndex = -1;
        this.showTranslation = false;
        this.isFullscreen = false;
        
        this.bindEvents();
    }
    
    bindEvents() {
        // 切换显示翻译
        this.toggleTransBtn.addEventListener('click', () => {
            this.showTranslation = !this.showTranslation;
            this.toggleTransBtn.textContent = this.showTranslation ? '隐藏翻译' : '显示翻译';
            this.renderLyrics();
        });
        
        // 切换全屏歌词
        this.toggleFullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // 隐藏歌词
        this.hideLyricsBtn.addEventListener('click', () => {
            this.toggleLyricsVisibility();
        });
        
        // 退出全屏
        this.exitFullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }
    
    toggleLyricsVisibility() {
        const isVisible = this.container.style.display !== 'none';
        this.container.style.display = isVisible ? 'none' : 'block';
        this.hideLyricsBtn.textContent = isVisible ? '显示歌词' : '隐藏歌词';
    }
    
    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        
        if (this.isFullscreen) {
            this.fullscreenOverlay.style.display = 'flex';
            this.renderFullscreenLyrics();
        } else {
            this.fullscreenOverlay.style.display = 'none';
        }
    }
    
    loadLyrics(lrcUrl) {
        if (!lrcUrl) {
            this.clearLyrics();
            return;
        }
        
        fetch(lrcUrl)
            .then(response => response.text())
            .then(lrcText => {
                this.parseLRC(lrcText);
                this.renderLyrics();
            })
            .catch(error => {
                console.error('加载歌词出错:', error);
                this.clearLyrics();
            });
    }
    
    parseLRC(lrcText) {
        this.lyrics = [];
        this.translations = [];
        
        const lines = lrcText.split('\n');
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
        
        lines.forEach(line => {
            // 忽略ID标签行
            if (line.startsWith('[ti:') || line.startsWith('[ar:') || line.startsWith('[al:') || line.startsWith('[by:')) {
                return;
            }
            
            // 处理翻译行
            if (line.includes('|')) {
                const parts = line.split('|');
                const originalLine = parts[0].trim();
                const translationLine = parts[1].trim();
                
                // 解析原文歌词时间戳
                let match;
                let text = originalLine;
                const timestamps = [];
                
                while ((match = timeRegex.exec(originalLine)) !== null) {
                    const minutes = parseInt(match[1]);
                    const seconds = parseInt(match[2]);
                    const milliseconds = match[3].length === 2 ? parseInt(match[3]) * 10 : parseInt(match[3]);
                    const time = minutes * 60 + seconds + milliseconds / 1000;
                    
                    timestamps.push(time);
                    text = text.replace(match[0], '');
                }
                
                text = text.trim();
                
                // 添加原文歌词
                timestamps.forEach(time => {
                    this.lyrics.push({
                        time,
                        text
                    });
                });
                
                // 添加翻译
                timestamps.forEach(time => {
                    this.translations.push({
                        time,
                        text: translationLine
                    });
                });
            } 
            // 处理普通歌词行
            else {
                let match;
                let text = line;
                const timestamps = [];
                
                while ((match = timeRegex.exec(line)) !== null) {
                    const minutes = parseInt(match[1]);
                    const seconds = parseInt(match[2]);
                    const milliseconds = match[3].length === 2 ? parseInt(match[3]) * 10 : parseInt(match[3]);
                    const time = minutes * 60 + seconds + milliseconds / 1000;
                    
                    timestamps.push(time);
                    text = text.replace(match[0], '');
                }
                
                text = text.trim();
                
                // 只添加非空行
                if (text && timestamps.length > 0) {
                    timestamps.forEach(time => {
                        this.lyrics.push({
                            time,
                            text
                        });
                    });
                }
            }
        });
        
        // 按时间排序
        this.lyrics.sort((a, b) => a.time - b.time);
        this.translations.sort((a, b) => a.time - b.time);
        
        this.activeLyricIndex = -1;
    }
    
    renderLyrics() {
        if (this.lyrics.length === 0) {
            this.lyricsContent.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
            return;
        }
        
        let html = '';
        
        this.lyrics.forEach((lyric, index) => {
            html += `<div class="lyrics-line" data-time="${lyric.time}">${lyric.text}</div>`;
            
            // 如果开启翻译并且有对应翻译，则插入翻译行
            if (this.showTranslation) {
                const translation = this.translations.find(trans => Math.abs(trans.time - lyric.time) < 0.1);
                if (translation) {
                    html += `<div class="lyrics-line translation" data-time="${translation.time}">${translation.text}</div>`;
                }
            }
        });
        
        this.lyricsContent.innerHTML = html;
        
        // 如果在全屏模式，也更新全屏歌词
        if (this.isFullscreen) {
            this.renderFullscreenLyrics();
        }
    }
    
    renderFullscreenLyrics() {
        this.fullscreenLyricsContent.innerHTML = this.lyricsContent.innerHTML;
        
        // 如果有活跃歌词，确保滚动到正确位置
        if (this.activeLyricIndex >= 0) {
            const activeLyrics = this.fullscreenLyricsContent.querySelectorAll('.lyrics-line');
            if (activeLyrics[this.activeLyricIndex]) {
                activeLyrics[this.activeLyricIndex].classList.add('active');
            }
        }
    }
    
    updateActiveLyric(currentTime) {
        if (this.lyrics.length === 0) return;
        
        let newIndex = -1;
        
        // 找到当前时间对应的歌词
        for (let i = 0; i < this.lyrics.length; i++) {
            if (this.lyrics[i].time <= currentTime) {
                newIndex = i;
            } else {
                break;
            }
        }
        
        // 如果活跃歌词没变，不需要更新
        if (newIndex === this.activeLyricIndex) return;
        
        this.activeLyricIndex = newIndex;
        
        // 更新普通歌词
        const lyricsLines = this.lyricsContent.querySelectorAll('.lyrics-line');
        lyricsLines.forEach(line => line.classList.remove('active'));
        
        if (this.activeLyricIndex >= 0 && lyricsLines[this.activeLyricIndex]) {
            lyricsLines[this.activeLyricIndex].classList.add('active');
            this.scrollToActiveLyric(lyricsLines[this.activeLyricIndex], this.lyricsWrapper);
        }
        
        // 如果在全屏模式，也更新全屏歌词
        if (this.isFullscreen) {
            const fullscreenLines = this.fullscreenLyricsContent.querySelectorAll('.lyrics-line');
            fullscreenLines.forEach(line => line.classList.remove('active'));
            
            if (this.activeLyricIndex >= 0 && fullscreenLines[this.activeLyricIndex]) {
                fullscreenLines[this.activeLyricIndex].classList.add('active');
            }
        }
    }
    
    scrollToActiveLyric(activeLine, container) {
        if (!activeLine || !container) return;
        
        const lineOffset = activeLine.offsetTop;
        const containerHeight = container.clientHeight;
        
        container.scrollTo({
            top: lineOffset - containerHeight / 2,
            behavior: 'smooth'
        });
    }
    
    clearLyrics() {
        this.lyrics = [];
        this.translations = [];
        this.activeLyricIndex = -1;
        this.lyricsContent.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
        
        if (this.isFullscreen) {
            this.fullscreenLyricsContent.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
        }
    }
}

// 全局歌词管理器实例
const lyricsManager = new LyricsManager(); 
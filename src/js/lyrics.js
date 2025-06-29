/**
 * 歌词管理模块
 */

class LyricsManager {
    constructor() {
        this.lyricsContent = document.querySelector('.lyrics-content');
        this.lyricsWrapper = document.querySelector('.lyrics-wrapper');
        this.container = document.querySelector('.lyrics-container');
        this.hideLyricsBtn = document.getElementById('hide-lyrics');
        
        this.lyrics = [];
        this.activeLyricIndex = -1;
        
        // 初始化歌词显示状态
        this.initLyricsVisibility();
        this.bindEvents();
        
        // 显示初始化消息
        this.clearLyrics();
        console.log('歌词管理器已初始化');
    }
    
    // 初始化歌词显示状态，从localStorage读取
    initLyricsVisibility() {
        const isHidden = localStorage.getItem('konghou_lyrics_hidden') === 'true';
        this.container.style.display = isHidden ? 'none' : 'block';
        if (this.hideLyricsBtn) {
            this.hideLyricsBtn.textContent = isHidden ? '显示歌词' : '隐藏歌词';
        }
    }
    
    bindEvents() {
        // 隐藏歌词
        if (this.hideLyricsBtn) {
            this.hideLyricsBtn.addEventListener('click', () => {
                this.toggleLyricsVisibility();
            });
        }
    }
    
    toggleLyricsVisibility() {
        const isVisible = this.container.style.display !== 'none';
        this.container.style.display = isVisible ? 'none' : 'block';
        this.hideLyricsBtn.textContent = isVisible ? '显示歌词' : '隐藏歌词';
        
        // 保存状态到localStorage
        localStorage.setItem('konghou_lyrics_hidden', isVisible);
    }
    
    loadLyrics(lrcUrl) {
        if (!lrcUrl) {
            this.clearLyrics();
            return Promise.reject('没有提供歌词URL');
        }
        
        console.log('开始加载歌词:', lrcUrl);
        
        return fetch(lrcUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`歌词加载失败: ${response.status}`);
                }
                return response.text();
            })
            .then(lrcText => {
                console.log('歌词加载成功，长度:', lrcText.length);
                this.parseLRC(lrcText);
                this.renderLyrics();
                return true;
            })
            .catch(error => {
                console.error('加载歌词出错:', error);
                this.clearLyrics();
                return false;
            });
    }
    
    parseLRC(lrcText) {
        this.lyrics = [];
        
        const lines = lrcText.split('\n');
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
        
        lines.forEach(line => {
            // 忽略ID标签行
            if (line.startsWith('[ti:') || line.startsWith('[ar:') || line.startsWith('[al:') || line.startsWith('[by:')) {
                return;
            }
            
            // 处理普通歌词行，忽略翻译
            if (line.includes('|')) {
                const parts = line.split('|');
                line = parts[0].trim(); // 只保留原文歌词
            }
            
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
        });
        
        // 按时间排序
        this.lyrics.sort((a, b) => a.time - b.time);
        
        this.activeLyricIndex = -1;
        console.log(`解析歌词完成，共${this.lyrics.length}行`);
    }
    
    renderLyrics() {
        if (this.lyrics.length === 0) {
            this.lyricsContent.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
            return;
        }
        
        let html = '';
        
        this.lyrics.forEach((lyric, index) => {
            html += `<div class="lyrics-line" data-time="${lyric.time}">${lyric.text}</div>`;
        });
        
        this.lyricsContent.innerHTML = html;
        console.log('歌词渲染完成');
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
    }
    
    scrollToActiveLyric(activeLine, container) {
        if (!activeLine || !container) return;
        
        const containerHeight = container.clientHeight;
        const lineTop = activeLine.offsetTop;
        const lineHeight = activeLine.clientHeight;
        
        // 计算滚动位置，使活跃歌词居中显示
        const scrollTop = lineTop - (containerHeight / 2) + (lineHeight / 2);
        
        container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }
    
    clearLyrics() {
        this.lyrics = [];
        this.activeLyricIndex = -1;
        if (this.lyricsContent) {
            this.lyricsContent.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
        }
    }
}

// 创建歌词管理器实例
const lyricsManager = new LyricsManager(); 
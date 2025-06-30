/**
 * 歌词管理模块
 */

class LyricsManager {
    constructor() {
        this.lyricsContent = document.querySelector('.lyrics-content');
        this.lyricsWrapper = document.querySelector('.lyrics-wrapper');
        this.container = document.querySelector('.lyrics-container');
        
        this.lyrics = [];
        this.activeLyricIndex = -1;
        
        // 显示初始化消息
        this.clearLyrics();
        console.log('歌词管理器已初始化');
        
        // 确保歌词容器尺寸一致
        this.ensureConsistentSize();
    }
    
    /**
     * 确保歌词容器尺寸一致
     */
    ensureConsistentSize() {
        // 不做任何动态尺寸调整，依赖CSS固定尺寸
    }
    
    loadLyrics(lrcUrl) {
        if (!lrcUrl) {
            this.clearLyrics();
            return Promise.reject('没有提供歌词URL');
        }
        
        console.log('开始加载歌词:', lrcUrl);
        
        // 添加加载状态
        this.setLoadingState(true);
        
        return fetch(lrcUrl)
            .then(response => {
                console.log('歌词请求状态:', response.status, response.statusText);
                if (!response.ok) {
                    throw new Error(`歌词加载失败: ${response.status}`);
                }
                return response.text();
            })
            .then(lrcText => {
                console.log('歌词加载成功，长度:', lrcText.length);
                this.parseLRC(lrcText);
                this.renderLyrics();
                this.setLoadingState(false);
                return true;
            })
            .catch(error => {
                console.error('加载歌词出错:', error, '歌词URL:', lrcUrl);
                
                // 尝试处理跨域问题：如果是Gitee URL，尝试调整URL格式
                if (lrcUrl.includes('gitee.com') && !lrcUrl.includes('/raw/')) {
                    console.log('尝试修正Gitee歌词URL...');
                    const fixedUrl = lrcUrl.replace(/\/blob\//, '/raw/');
                    console.log('修正后的URL:', fixedUrl);
                    
                    // 使用修正后的URL重新尝试
                    return fetch(fixedUrl)
                        .then(response => {
                            if (!response.ok) throw new Error(`修正URL后仍然失败: ${response.status}`);
                            return response.text();
                        })
                        .then(lrcText => {
                            console.log('使用修正URL加载歌词成功');
                            this.parseLRC(lrcText);
                            this.renderLyrics();
                            this.setLoadingState(false);
                            return true;
                        })
                        .catch(err => {
                            console.error('修正URL后仍然失败:', err);
                            this.clearLyrics();
                            this.setLoadingState(false);
                            return false;
                        });
                }
                
                this.clearLyrics();
                this.setLoadingState(false);
                return false;
            });
    }
    
    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setLoadingState(isLoading) {
        if (this.container) {
            if (isLoading) {
                this.container.classList.add('loading');
            } else {
                this.container.classList.remove('loading');
            }
        }
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
        if (!this.lyricsContent) return;
        
        if (this.lyrics.length === 0) {
            this.lyricsContent.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
            return;
        }
        
        let html = '';
        
        // 添加空白行以确保滚动效果
        html += '<div class="lyrics-line lyrics-padding"></div>';
        
        this.lyrics.forEach((lyric, index) => {
            html += `<div class="lyrics-line" data-time="${lyric.time}">${lyric.text}</div>`;
        });
        
        // 添加空白行以确保滚动效果
        html += '<div class="lyrics-line lyrics-padding"></div>';
        
        this.lyricsContent.innerHTML = html;
        console.log('歌词渲染完成');
    }
    
    updateActiveLyric(currentTime) {
        if (this.lyrics.length === 0 || !this.lyricsContent) return;
        
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
        const lyricsLines = this.lyricsContent.querySelectorAll('.lyrics-line:not(.lyrics-padding)');
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
        
        // 使用平滑滚动
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
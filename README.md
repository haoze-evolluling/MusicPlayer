# 箜篌音乐播放器 (Konghou Music Player)

一个功能丰富的跨平台音乐播放器，基于Electron开发，支持在线音乐播放、歌词同步显示、播放列表管理等功能。

## 功能特点

- **音乐播放**：支持在线音频格式播放，提供标准播放控制功能
- **播放模式**：支持列表循环、单曲循环和随机播放
- **倍速播放**：支持0.5x至4.0x的播放速度调整
- **播放列表**：支持显示正在播放列表、播放历史和自定义歌单
- **在线搜索**：支持在GitHub和Gitee仓库中搜索音乐
- **歌词显示**：支持同步滚动显示歌词，支持翻译显示和全屏模式
- **界面美观**：响应式设计，支持自定义背景
- **跨平台**：支持Windows、macOS和Linux系统

## 安装与运行

### 方法一：从源代码构建

1. 克隆仓库
   ```
   git clone https://github.com/your-username/konghou-musicplayer.git
   cd konghou-musicplayer
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 运行应用
   ```
   npm start
   ```

4. 构建应用
   ```
   npm run build
   ```

### 方法二：下载已构建的应用

从[Release页面](https://github.com/your-username/konghou-musicplayer/releases)下载对应平台的安装包，直接安装即可。

## 配置说明

1. **音乐库配置**：
   - 编辑`src/js/config.js`文件
   - 将`CONFIG.api.github.repo`和`CONFIG.api.gitee.repo`修改为你自己的音乐仓库

2. **默认设置**：
   - 可以在`config.js`文件中修改默认音量、播放速度和循环模式等设置

## 资源说明

需要添加以下静态资源：

1. **播放器图标**：
   - `src/assets/logo.png`：应用logo
   - `src/assets/default-cover.png`：默认封面图片

2. **控制按钮图标**：
   - `src/assets/play.svg`：播放按钮
   - `src/assets/pause.svg`：暂停按钮  
   - `src/assets/next.svg`：下一首按钮
   - `src/assets/prev.svg`：上一首按钮
   - `src/assets/repeat.svg`：列表循环按钮
   - `src/assets/repeat-one.svg`：单曲循环按钮
   - `src/assets/shuffle.svg`：随机播放按钮
   - `src/assets/volume.svg`：音量按钮
   - `src/assets/volume-low.svg`：低音量按钮
   - `src/assets/volume-mute.svg`：静音按钮
   - `src/assets/settings.svg`：设置按钮

3. **播放列表封面**：
   - `src/assets/playlist-covers/favorites.jpg`：我喜欢的音乐封面
   - `src/assets/playlist-covers/history.jpg`：最近播放封面
   - `src/assets/playlist-covers/chinese.jpg`：华语经典封面
   - `src/assets/playlist-covers/western.jpg`：欧美流行封面
   - `src/assets/playlist-covers/custom.jpg`：自定义封面

## 快捷键

- **空格**：播放/暂停
- **Ctrl + 左箭头**：上一首
- **Ctrl + 右箭头**：下一首
- **ESC**：退出全屏歌词

## 音乐仓库格式

在GitHub或Gitee上创建音乐仓库时，推荐使用以下目录结构：

```
music-repo/
  ├── 歌手1-歌曲1.mp3
  ├── 歌手1-歌曲1.lrc (歌词文件，可选)
  ├── 歌手1-歌曲1.jpg (封面图片，可选)
  ├── 歌手2-歌曲2.mp3
  └── ...
```

## 开发者说明

项目使用以下技术栈开发：

- **Electron**：跨平台桌面应用开发框架
- **HTML/CSS/JavaScript**：前端基础技术
- **jQuery**：简化DOM操作
- **Layer.js**：弹窗组件

## 许可证

本项目基于MIT许可证开源。 
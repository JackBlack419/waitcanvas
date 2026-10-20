# 等绘 WaitCanvas

让等待，慢慢成画。  
Turn waiting time into a little painting.

[在线体验 / Live demo](https://cog-hfxp.upma.site/) · [中文介绍](#中文介绍) · [English](#english) · [下载 / Downloads](https://github.com/JackBlack419/waitcanvas/releases/latest) · [反馈问题 / Report a bug](https://github.com/JackBlack419/waitcanvas/issues)

## 中文介绍

等绘是一个免费开源的小工具：当你的网站正在等待 AI 回答、上传文件或加载内容时，可以展示一幅慢慢画出来的小画。

它包含 **6 种画法、每种 10 幅，共 60 幅作品**。你可以挑选作品、改变颜色、调整绘画速度，再把动画放进自己的网页。

> 本项目由本人vibe coding完成，若有bug，烦请原谅，谢谢

### 在线体验

打开 [等绘展示网站](https://cog-hfxp.upma.site/)，无需下载即可体验。

**小提示：加载“画种总览”时可能有点慢，请耐心等待。页面会显示等待提示，画作准备好后自动收起。**

### 不懂编程，也想先看看？

1. 打开 [下载页面（Releases）](https://github.com/JackBlack419/waitcanvas/releases/latest)。
2. 下载 **waitcanvas-free-v0.4.1.zip**，然后解压。
3. 用浏览器打开解压后的 **demo.html**。
4. 选择画种与作品，点击“开始”观看绘画，或点击“看成品”。

这个示例已把绘画代码装进一个 HTML 文件，不需要账号、API 密钥或付费服务。

### 有哪些画法？

| 画种 | 数量 | 部分题材 |
| --- | --- | --- |
| 油画 | 10 | 海边落日、睡莲池、灯塔月夜 |
| 线条画 | 10 | 咖啡时光、单车、提琴 |
| 蜡笔画 | 10 | 热气球、蓝鲸、企鹅 |
| 国画 | 10 | 墨竹、松鹤、游虾 |
| 素描 | 10 | 苹果与方体、玻璃瓶与梨、旧靴 |
| 彩铅画 | 10 | 双锦鲤、草莓、翠鸟 |

所有作品都能逐笔播放。素描分为起形、明暗、交叉排线和细节刻画，也可以暂停、拖动进度或直接看成品。

### 在电脑上运行完整工作台

完整工作台提供配色、速度、作品轮换、代码复制和下载功能。

1. 安装 [Node.js](https://nodejs.org/) 22 或更新版本。它只是运行本地网页的小工具。
2. 在仓库页面点击 **Code → Download ZIP**，解压；也可以使用 Git 下载。
3. 在解压后的项目文件夹中打开终端，依次运行下面两行命令，每行输入后按回车：

~~~text
npm run package:download
npm start
~~~

4. 用浏览器打开终端显示的地址，通常是 **http://127.0.0.1:4176**。
5. 首页是工作台；在地址后加 **/gallery.html** 可以浏览全部 60 幅作品。

无需运行 npm install，本项目没有第三方运行依赖。完整工作台使用 JavaScript 模块，请通过上面的本地地址访问；直接双击 dist/index.html 可能被浏览器拦截。只有打包后的独立 demo.html 适合直接打开。

### 给开发者：放进自己的网页

下载免费组件包，将其中的 JS 文件保留在同一个目录，然后在网页中加入：

~~~html
<script type="module" src="./waitcanvas.js"></script>

<wait-canvas
  id="loading-art"
  theme="sketch"
  sample="bottle-pear"
  state="loading"
  style="display:block;height:320px"
></wait-canvas>
~~~

实际任务结束时，立即显示你的结果，并停止绘画：

~~~js
document.getElementById('loading-art').setAttribute('state', 'success');
~~~

theme 选择画种，sample 选择作品。全部作品 ID 见 [catalog.js](dist/catalog.js)，更多设置和 React 示例见 [接入说明](dist/QUICKSTART.md) 与 [react-example.jsx](dist/react-example.jsx)。

绘画的播放进度不等于实际任务进度。任务完成时，不需要等画画完。

### 免费与开源

源码、笔刷和本站程序绘制作品均采用 [MIT 许可](LICENSE)。可以使用、修改、分享和商用，保留版权与许可声明即可。没有收费层。

这些动画由浏览器本地绘制，不会调用 AI 生图服务，也不是真人作画录像。部分构图研究参考了馆藏作品，来源与借鉴范围见 [创作参考](dist/INSPIRATION.md)。

遇到问题，欢迎 [提交 Issue](https://github.com/JackBlack419/waitcanvas/issues)。简单告诉我你做了什么、出现了什么问题，以及使用的浏览器；欢迎附上截图。贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## English

WaitCanvas is a free, open-source collection of painting animations for loading screens. Show a little picture being drawn while your website waits for an AI response, a file upload, or other content.

It includes **60 paintings: 6 styles with 10 different compositions each**. Choose a painting, change its colors and speed, and use it on your own website.

> I built this project through vibe coding. If you find bugs, please bear with me. Thank you.

### Live demo

Visit the [WaitCanvas demo website](https://cog-hfxp.upma.site/) to try it without downloading anything.

**Please note: the painting gallery (“画种总览”) may take a little longer to load. A waiting message is shown while the paintings are being prepared, and disappears when they are ready.**

### Try it without coding

1. Open the [Downloads page (Releases)](https://github.com/JackBlack419/waitcanvas/releases/latest).
2. Download and unzip **waitcanvas-free-v0.4.1.zip**.
3. Open the extracted **demo.html** in your browser.
4. Choose a style and painting. Click “开始” (Start) to watch it being drawn, or “看成品” (Finished picture) to see the result.

This demo is a single HTML file. You do not need an account, API key, or paid service. The current website controls are in Chinese; this guide explains how to get started.

### What is included?

| Style | Paintings | Examples |
| --- | --- | --- |
| Oil painting | 10 | Sunset, lily pond, lighthouse at night |
| Line drawing | 10 | Coffee cup, bicycle, violin |
| Crayon | 10 | Hot-air balloon, whale, penguin |
| Chinese ink | 10 | Bamboo, pine and crane, shrimp |
| Pencil sketch | 10 | Apple and cube, bottle and pear, boots |
| Colored pencil | 10 | Koi, strawberries, kingfisher |

You can pause a painting, move through its drawing progress, or show the finished picture. Sketches have separate outline, shading, cross-hatching, and detail stages.

### Run the full studio on your computer

1. Install [Node.js](https://nodejs.org/) 22 or newer.
2. Click **Code → Download ZIP** on this repository and unzip it, or clone it with Git.
3. Open a terminal in the project folder and run these commands, one at a time:

~~~text
npm run package:download
npm start
~~~

4. Open the address printed in the terminal, usually **http://127.0.0.1:4176**.
5. The home page is the studio. Visit **/gallery.html** to browse all 60 paintings.

You do not need to run npm install. There are no third-party runtime dependencies. Use the local server for the full studio, because browsers may block JavaScript modules when you double-click dist/index.html. The packaged, self-contained demo.html can be opened directly.

### Add an animation to your website

Download the component ZIP and keep its JavaScript files together. Use the HTML example in the Chinese section above.

- **theme** chooses the style.
- **sample** chooses a painting. Find all IDs in [catalog.js](dist/catalog.js).
- **state="loading"** starts drawing.
- Set **state** to **success**, **error**, or **cancelled** when the real task ends.

See the [integration guide](dist/QUICKSTART.md) and [React example](dist/react-example.jsx) for more options. The integration guide and current interface are mainly in Chinese.

The painting's progress is a playback position, not your task's real progress. Show the result as soon as your task finishes.

### License and contributions

The source code, brushes, and locally generated sample artwork use the [MIT license](LICENSE). You may use, change, share, and use them commercially while keeping the copyright and license notice. There is no paid tier.

Rendering happens locally in the browser. It does not call an AI image service or reproduce footage of a person painting. Museum references and the scope of inspiration are documented in [INSPIRATION.md](dist/INSPIRATION.md); museum images are not bundled.

Found a bug? Please [open an issue](https://github.com/JackBlack419/waitcanvas/issues) with the steps you took, what went wrong, and your browser. Screenshots are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) if you would like to help.

### Project files

| File or folder | Purpose |
| --- | --- |
| dist/ | Website, drawing engine, and sample paintings |
| scripts/ | Local server and download packaging tools |
| tests/ | Automated checks; run with npm test |
| LICENSE | MIT license |

The project is a static HTML/CSS/JavaScript website. No backend or database is required. The private: true setting in package.json prevents accidental publishing to npm; it does not restrict this public GitHub repository or the MIT license.


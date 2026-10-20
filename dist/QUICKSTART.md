# WaitCanvas v0.4.1 免费体验包

## 先运行

直接打开 demo.html 可体验六类样片与开始、完成、失败、取消状态。此文件内联了引擎与主题，无需网络。下载包中的 LICENSES.txt 适用于此示例及所有源文件。

## 普通网页

将 waitcanvas.js、themes.js、painterly.js、studies.js 和 catalog.js 放在同一目录。通过本地 HTTP 服务器或你的产品开发环境打开页面（外部 ES Module 不适合直接从 file:// 引入）。

```html
<script type="module" src="./waitcanvas.js"></script>
<wait-canvas id="art" theme="mist" seed="a-little-pause"
  state="idle" style="display:block;height:320px"></wait-canvas>
```

请求驱动状态的模式：

```js
const art = document.getElementById('art');
let activeRequest = 0;
let activeController;
async function runTask() {
  const id = ++activeRequest;
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  art.state = 'idle';
  const showTimer = setTimeout(() => {
    if (id === activeRequest) art.state = 'loading';
  }, 400);
  try {
    // 替换为你已有的服务接口，组件本身不发起任何 AI 请求。
    const response = await fetch('/your-existing-endpoint', { signal: controller.signal });
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    if (id !== activeRequest) return;
    art.state = 'success';
    // 立刻更新你的结果区域，不需要等待绘画完成。
    console.log(data);
  } catch (error) {
    if (id !== activeRequest) return;
    art.state = error.name === 'AbortError' ? 'cancelled' : 'error';
    // 在你的界面展示相应状态，并提供重试操作。
  } finally {
    clearTimeout(showTimer);
  }
}
function cancelTask() { activeController?.abort(); }
```

上面的 URL 是示意，需要替换为已有接口。代码示例展示 400ms 动画启动延迟；如果不希望短请求看到静态画面，可由宿主区域控制组件显示。请求进度由应用单独展示，不从绘画完成度推算。

## React

react-example.jsx 提供客户端包装，要求宿主已有 React 环境。Next.js 等服务端渲染环境不能在服务端导入使用 HTMLElement 的文件；示例在 useEffect 中动态引入。TypeScript 项目需要为 JSX 自定义元素补充类型声明，或自行封装原生元素，不宣称开箱覆盖所有版本。

## 参数

theme: oil / line / crayon / ink / sketch / pencil；旧版 mist / garden / orbit 仍可用（未知值回退 mist）
seed: 不超过 80 字符建议；相同版本与参数可复现构图
primary / accent / paper: 六位十六进制颜色，如 #517b70；无效值回退默认
speed: 0.5–2，默认 1
state: idle / loading / success / error / cancelled
reduced-motion: true 强制静态；否则遵循系统偏好
static: 存在该属性时显示完整静态构图

idle 展示完整静态画面；loading 从构图开始绘制；其余状态冻结当前画面并释放动画循环。返回 loading 会重新绘制。

通过主题切换、seed、颜色或 speed 的修改不会发起任何网络请求。组件暂停隐藏标签页与离开可视区的动画，卸载时移除观察器与监听。

工作台的等待时长、卡片布局和自动主题轮换属于演示设置，复制和下载保留当前画种和作品的绘制配置。真实产品可通过容器 CSS 控制布局，在每次开始任务时修改 theme 和 seed；要避免相邻重复，从不包含上一主题的集合中选取下一主题。

## 无障碍与隐私

画布为装饰内容，宿主需在结果区域提供文字状态、取消和重试操作，以及合适的 aria-busy。不要把每一笔向读屏播报。组件尊重减少动态效果设置，无遥测，不读提示词。

## 授权与已知限制

源码、界面、绘制规则和所有原创作品统一采用 MIT，允许使用、修改、分发及商用，保留版权与许可声明即可。完整条款见 LICENSES.txt；没有额外主题转售限制。所有主题均为此项目制作的绘制规则，不包括参考网站或第三方动画平台素材。

这是 v0.4 免费开源版；截至打包时完成 Node 自动化测试和桌面浏览器操作验证，可在项目目录运行 npm test 复查自动化测试。尚未完成真实手机、Safari、Firefox、低功耗设备和长时间稳定性测试。性能数字不得外推为所有设备的保证。没有收款、在线保存账号或定制表单提交服务。


v0.2 回放参数：progress="0" 到 "100" 可定位绘制进程，存在此属性时暂停自动播放；移除 progress 继续。paused 属性存在时冻结回放，移除后继续。progress 与 paused 只控制画面，不改变业务请求状态。系统减少动态效果优先显示成品。新画种完整后停止消耗绘制循环。

当前六种画法每类十幅，共六十幅程序绘画，素材与源代码均开源。这些是材质模拟，尚未做专业美术评审。


v0.4 作品参数：sample 选择具体构图，ID 列表见 catalog.js。seed 只改变作品细节。素描十幅重新设计，起形阶段分配 24% 回放时间，随后为明暗、交叉排线和压暗刻画。绘制阶段由 paint-progress 事件的 detail.stage 提供，detail.progress 为回放百分比。

完整组件包为 waitcanvas-free-v0.4.1.zip；完整工作台、脚本、测试与文档源码包为 waitcanvas-source-v0.4.1.zip。源码包不包含站点标识或凭证，可依 README 在本地独立运行。

公开仓库 / Public repository: https://github.com/JackBlack419/waitcanvas

本项目由本人vibe coding完成，若有bug，烦请原谅，谢谢

I built this project through vibe coding. If you find bugs, please bear with me. Thank you.

# 参与等绘 · Contributing to WaitCanvas

欢迎提出问题、完善画作、修改代码或帮助翻译。第一次参与开源也没关系。

## 反馈问题 / Report a bug

请在 GitHub 的 Issues 中说明：

- 你做了哪些操作 / Steps you took
- 你希望看到什么 / What you expected
- 实际发生了什么 / What happened instead
- 使用的浏览器，以及方便时提供截图 / Your browser and, if possible, a screenshot

不需要先懂代码。Please feel free to report a problem even if you do not code.

## 修改项目 / Make a change

1. Fork 本仓库，再把自己的副本下载到电脑。 / Fork this repository and download your copy.
2. 按 README 运行工作台。 / Follow the README to run the studio.
3. 修改后运行下面的检查。 / Run these checks after making changes:

~~~text
npm test
npm run package:download
node scripts/check-artifacts.mjs
~~~

4. 用浏览器看看成品及绘制过程，再提交 Pull Request，简单说明改动。 / Check the finished painting and playback in a browser, then open a pull request with a short explanation.

## 新增作品 / Add a painting

- 在 dist/catalog.js 添加作品 ID 和名称，在绘画模块中加入对应构图。 / Add an ID and name in dist/catalog.js, then implement its composition in the drawing modules.
- 每个作品应有自己的构图；更换随机种子不算新作品。 / Give each painting its own composition; a different seed alone is not a new painting.
- 素描保留起形、明暗、交叉排线和刻画阶段。 / Keep visible outline, shading, cross-hatching, and detail stages for sketches.
- 检查暂停、进度拖动、减少动态效果，以及任务成功、失败、取消后的停止行为。 / Check pausing, seeking, reduced motion, and stopping after task completion, failure, or cancellation.
- 如增加作品数量，请同步更新文案、下载包及相关检查。 / If the painting count changes, update the page text, packages, and relevant checks.

只加入自己创作或授权兼容的内容；参考他人作品时记录来源和借鉴范围。贡献按项目 MIT 许可发布。

Only contribute your own work or content with compatible permission. Record references and explain what you borrowed. Contributions are released under the project's MIT license.

谢谢你的帮助。Thank you for helping.


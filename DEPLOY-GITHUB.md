# 发布到 GitHub Pages

教程、在线练习、Three.js 实验和结业游戏都支持纯静态托管。无需运行 Node.js 服务器或安装依赖。

## 第一次发布

1. 在原始工程根目录运行 `node academy/tests.mjs`、`node academy/package.mjs`、`node academy/export-pages.mjs`。
2. 在 GitHub 创建独立仓库，例如 `little-worlds-academy`。免费方案可使用公开仓库；站点将公开访问。
3. 将 `deliverables/little-worlds-academy/` **里面的文件**提交到仓库 `main` 分支根目录，包括隐藏文件 `.nojekyll`。不要上传外层工程。
4. 仓库 Settings → Pages → Source 选择 **Deploy from a branch**，Branch 选择 **main**，Folder 选择 **/(root)**，保存。
5. 等待 Pages 部署完成，通过 GitHub 显示的站点地址打开。项目地址通常是 `https://你的用户名.github.io/little-worlds-academy/`。

`.nojekyll` 会保留 `project/vendor/` 中的 Three.js 文件；课程所有资源使用相对路径，因此适配仓库子目录。不要把首页移到其他层级。

## 更新与验证

修改后重新运行上面的检查、打包和导出命令，把更新文件提交到同一个仓库。若删除了课程文件，也要在发布仓库删除对应旧文件。GitHub Pages 会自动重新部署。

首次上线验证：首页与三维实验正常；运行一条练习；故意写 `while(true){}` 检查超时；打开结业游戏；下载一个 ZIP；刷新确认笔记保存。

代码练习由具有独立来源和 CSP 的隐藏 iframe 创建 Worker；禁用网络连接与页面存储访问，超时移除整个隔离环境。这个机制无需自定义 HTTP 响应头。

学习记录保存在当前浏览器，不会上传 GitHub。换设备先导出 JSON，再在新设备导入；本地地址和线上地址的存储相互独立。

官方说明：[配置 Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

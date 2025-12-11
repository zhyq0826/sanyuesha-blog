# 三月沙 · 个人站点 (Astro + React + MDX)

> 内容驱动的个人站点：博客分组、时间线、作品与工具展示，支持 Utterances 评论。

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建静态站点
npm run build

# 预览构建产物
npm run preview
```

## 内容模型

- `src/content/posts`: 博客文章（含 `group`、`tags`、`featured`）
- `src/content/insights`: 前沿资讯，附可选 `source`
- `src/content/projects`: 作品，含 `status/link/repo`
- `src/content/tools`: 工具下载，含 `version/download/changelog`
- 集合定义：`src/content/config.ts`（Zod 校验）

## 页面与路由

- `/`：首页精选（最新博客、资讯、作品、工具）
- `/blog`：文章分组列表
- `/blog/[slug]`：文章详情 + Utterances 评论
- `/timeline`：时间线视图
- `/insights`：资讯列表
- `/projects`：作品列表
- `/tools`：工具列表

## 评论配置

编辑 `src/config/site.ts`：

- `commentConfig.repo`：`owner/repo`，开启 Issues/Discussions
- `issueTerm`：默认为 `pathname`
- `label`：可自定义
- `theme`：Utterances 主题（例如 `github-light`）

## 部署

- **GitHub Pages（自定义域 sanyuesha.com）**
  - 仓库：`zhyq0826/zhyq0826.github.io`
  - 已提供 `public/CNAME`，内容为 `sanyuesha.com`，推送后 Pages 会自动识别
  - 构建：`npm run build`，输出目录 `dist/`；推送 `dist/` 到仓库根目录或通过 GitHub Actions 发布
- **参考 Actions（可选）**
  - 使用 `actions/setup-node` 安装依赖，运行 `npm ci && npm run build`
  - 将 `dist/` 发布到 `main`（用户页可直接用主分支）或 `gh-pages` 分支
- **其他托管**
  - Vercel：框架 Astro，构建 `npm run build`，输出 `dist`
  - Netlify：构建命令 `npm run build`，发布目录 `dist`

## 结构示意

```mermaid
graph TD
  contentFS[Astro Content Collections] --> pages[Pages (列表/时间线/详情)]
  pages --> blogList[Blog 分组]
  pages --> timeline[时间线]
  pages --> detail[详情 + 评论]
  detail --> utterances[Utterances]
  contentFS --> otherViews[Projects/Tools/Insights]
```


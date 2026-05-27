# 在线工具箱

一个基于 Next.js 的在线多功能工具平台，已部署并通过 GitHub 仓库统一管理。该项目包含二维码生成、密码生成、文本处理、PDF转换、图片处理、后台管理等功能。

## 🚀 项目概览

- 框架：Next.js 14（App Router）
- 样式：Tailwind CSS 3
- UI：shadcn/ui 风格组件
- 数据库：Cloudflare D1
- 部署平台：Cloudflare Pages
- 代码托管：GitHub 仓库

## ✨ 核心功能

- 二维码生成：创建可下载二维码图像
- 密码生成：支持复杂规则的安全密码生成
- 文本工具：大小写转换、去空格、反转、统计等
- PDF 转换：文件上传与 PDF 处理操作
- 图片处理：图片尺寸调整、格式/质量转换
- 后台管理：`/houtai` 后台页面与管理接口

## 🚀 本地运行

1. 安装依赖

```bash
npm install
```

2. 启动开发服务器

```bash
npm run dev
```

3. 访问

```text
http://localhost:3000
```

4. 项目构建

```bash
npm run build
```

## 📦 部署

部署命令：

```bash
npm run deploy
```

> 该项目使用 Cloudflare Pages 进行静态站点部署，仓库可以直接与 GitHub 关联。

## � 本地修改后上传到 GitHub

如果你已经将项目关联到 GitHub 仓库，推荐流程如下：

1. 在本地修改代码并保存。
2. 检查当前仓库状态：

```bash
git status
```

3. 添加修改文件：

```bash
git add .
```

4. 提交更改：

```bash
git commit -m "更新功能或修复问题"
```

5. 推送到主分支（或你配置的部署分支）：

```bash
git push origin main
```

6. 进入 Cloudflare Pages 仪表盘查看部署状态，通常 GitHub 推送后会自动触发部署。

> 如果 Cloudflare Pages 已配置为监听 `main` 分支，则每次推送后会自动部署最新代码。

## �🔧 数据库配置

项目使用 Cloudflare D1 数据库。常见命令：

```bash
npx wrangler d1 create toolbox-db
npm run d1:migrate
```

如果需要初始化默认管理员账户：

```bash
npx wrangler d1 execute toolbox-db --file=./src/data/init.sql
```

## 🛠️ 主要脚本

- `npm run dev`：本地开发模式
- `npm run build`：构建项目
- `npm run start`：生产模式启动
- `npm run lint`：运行 ESLint
- `npm run deploy`：部署到 Cloudflare Pages
- `npm run d1:migrate`：执行 D1 数据库结构初始化

## 🔐 管理后台

- 管理后台路径：`http://localhost:3000/houtai`
- 后台 API 路径：`/api/houtai`

默认管理员账号（如已初始化）：

- 用户名：`admin`
- 密码：`admin123`

## 📁 项目结构

```text
src/
├── app/
│   ├── api/
│   │   └── houtai/
│   │       └── route.ts
│   ├── houtai/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   └── DatabaseManager.tsx
│   ├── layout/
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   └── ToolCard.tsx
│   ├── tools/
│   │   ├── ImageProcessor.tsx
│   │   ├── PDFConverter.tsx
│   │   ├── PasswordGenerator.tsx
│   │   ├── QRCodeGenerator.tsx
│   │   └── TextTools.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── data/
│   ├── db.ts
│   ├── init.sql
│   ├── migrate_session_token.sql
│   └── schema.sql
└── lib/
    ├── database-admin.ts
    ├── mock-database.ts
    └── utils.ts

scripts/
└── deploy.ps1

package.json
postcss.config.js
tailwind.config.js
tsconfig.json
wrangler.toml
next.config.js
README.md
PROJECT_STRUCTURE.md
```

## ℹ️ 说明

- 后台管理入口已设置为 `/houtai`
- API 路径已设置为 `/api/houtai`
- 说明文档已针对仓库管理与 Cloudflare 部署进行了更新

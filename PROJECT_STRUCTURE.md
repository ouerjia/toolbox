# 在线工具箱 - 项目结构文档

该文档介绍项目目录结构、关键文件和部署说明，适用于已经通过 GitHub 仓库进行托管和 Cloudflare Pages 部署的项目。

## 📁 项目目录结构

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

## 📋 关键文件说明

### 根目录文件

- `package.json`：项目依赖、脚本和元数据
- `tsconfig.json`：TypeScript 编译配置
- `tailwind.config.js`：Tailwind CSS 配置
- `postcss.config.js`：PostCSS 配置
- `next.config.js`：Next.js 项目配置
- `wrangler.toml`：Cloudflare Pages 与 D1 数据库绑定配置
- `README.md`：项目说明文档
- `PROJECT_STRUCTURE.md`：项目结构说明
- `scripts/deploy.ps1`：PowerShell 部署脚本

### 应用文件

- `src/app/page.tsx`：站点首页入口
- `src/app/layout.tsx`：全局布局与页面元数据
- `src/app/houtai/page.tsx`：后台管理页面入口
- `src/app/api/houtai/route.ts`：后台 API 路由处理
- `src/globals.css`：全局样式

### 组件文件

- `src/components/layout/`：页面布局组件（导航、页脚、卡片、Hero）
- `src/components/tools/`：工具页面组件
- `src/components/admin/DatabaseManager.tsx`：管理后台数据库辅助组件
- `src/components/ui/`：可复用 UI 组件

### 数据与库文件

- `src/data/db.ts`：D1 数据库连接和查询逻辑
- `src/data/init.sql`：初始数据导入脚本
- `src/data/schema.sql`：数据库表结构定义
- `src/data/migrate_session_token.sql`：会话 token 迁移脚本
- `src/lib/database-admin.ts`：后台数据库管理逻辑
- `src/lib/mock-database.ts`：模拟数据工具
- `src/lib/utils.ts`：通用工具函数

## 🔧 部署与 GitHub 仓库

该项目适合通过 GitHub 仓库管理源代码，并使用 Cloudflare Pages 进行自动部署。

- 推荐工作流：将代码推送到 GitHub 仓库，然后在 Cloudflare Pages 中连接该仓库。
- 本地构建：`npm run build`
- 发布部署：`npm run deploy`

## 🚀 运行与部署命令

- `npm install`：安装依赖
- `npm run dev`：本地开发启动
- `npm run build`：构建项目
- `npm run start`：生产模式启动
- `npm run deploy`：部署到 Cloudflare Pages
- `npm run d1:migrate`：执行 D1 数据库初始化

## 🔐 管理后台入口

- 后台页面：`/houtai`
- API 路由：`/api/houtai`

## 🌐 说明

本项目现已支持 GitHub 仓库管理，并且文档内容已同步为实际部署与当前目录结构。
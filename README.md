# 工具箱 - 在线多功能工具站

一个基于 Next.js 的在线多功能工具平台，提供二维码生成、密码生成、文本处理、PDF转换、图片处理等常用工具。

## 🚀 项目简介

- 框架：Next.js 14（App Router）
- 样式：Tailwind CSS 3
- 组件：shadcn/ui 风格组件
- 数据库：Cloudflare D1（SQLite）
- 部署：Cloudflare Pages

## ✨ 核心功能

- 二维码生成：生成可下载的二维码图片
- 密码生成：支持复杂字符、多种规则的安全密码
- 文本工具：文本大小写转换、去空格、反转、统计等
- PDF转换：文件上传与 PDF 处理功能
- 图片处理：图片尺寸调整、格式转换、质量控制
- 后台管理：后台管理页面 `/houtai`，包含管理员、内容、日志管理

## 📦 本地运行

### 安装依赖

```bash
npm install
```

### 启动开发模式

```bash
npm run dev
```

访问： `http://localhost:3000`

### 构建项目

```bash
npm run build
```

### 部署到 Cloudflare Pages

```bash
npm run deploy
```

## 🛠️ 数据库配置

### 创建 D1 数据库

```bash
npx wrangler d1 create toolbox-db
```

### 更新 `wrangler.toml`

```toml
[[d1_databases]]
binding = "DB"
database_name = "toolbox-db"
database_id = "your-database-id"
```

### 初始化数据库

```bash
npm run d1:migrate
```

如果需要初始化默认管理员账户，请执行：

```bash
npx wrangler d1 execute toolbox-db --file=./src/data/init.sql
```

## 🔧 管理后台

后台入口路径： `http://localhost:3000/houtai`

默认管理员账号（如果已初始化）：

- 用户名：`admin`
- 密码：`admin123`

## 📁 项目结构

```
app/
├── src/
│   ├── app/
│   │   ├── houtai/               # 后台管理页面
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── houtai/           # 后台 API 路由
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx            # 根布局与 SEO 配置
│   │   └── page.tsx              # 主页入口
│   ├── components/
│   │   ├── tools/                # 各项工具组件
│   │   └── ui/                   # 通用 UI 组件
│   ├── data/                     # 数据库脚本与初始化
│   └── lib/                      # 工具函数库
├── scripts/
│   └── deploy.ps1                # PowerShell 部署脚本
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── wrangler.toml
└── README.md
```

## 🌐 环境变量示例

创建 `.env.local`：

```env
DATABASE_URL=file:./dev.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📌 说明

- 后台管理页面路径已由 `/admin` 替换为 `/houtai`
- API 后端路径已由 `/api/admin` 替换为 `/api/houtai`
- 本项目以前端交互为主，后台接口用于管理员登录与数据管理

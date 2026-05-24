# 在线工具箱 - 项目结构文档

## 📁 项目目录

```
src/
├── app/
│   ├── houtai/                     # 后台管理页面入口
│   │   └── page.tsx
│   ├── api/
│   │   └── houtai/                 # 后台 API 路由
│   │       └── route.ts
│   ├── globals.css                 # 全局样式
│   ├── layout.tsx                  # 根布局与 metadata
│   └── page.tsx                    # 首页入口
├── components/
│   ├── tools/                      # 各类工具组件
│   │   ├── ImageProcessor.tsx
│   │   ├── PDFConverter.tsx
│   │   ├── PasswordGenerator.tsx
│   │   ├── QRCodeGenerator.tsx
│   │   └── TextTools.tsx
│   ├── admin/                      # 管理后台辅助组件
│   │   └── DatabaseManager.tsx
│   └── ui/                         # 可复用 UI 组件
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── data/
│   ├── db.ts                       # D1 数据库连接与执行
│   ├── init.sql                    # 默认数据初始化脚本
│   └── schema.sql                  # 数据库表结构定义
└── lib/
    └── utils.ts                   # 通用工具函数

scripts/
└── deploy.ps1                       # PowerShell 部署脚本

package.json                         # 项目依赖与脚本
tsconfig.json                        # TypeScript 配置
postcss.config.js                    # PostCSS 配置
tailwind.config.js                   # Tailwind CSS 配置
wrangler.toml                        # Cloudflare Pages / D1 配置
README.md                            # 项目说明文档
```

## 📋 文件说明

### 根目录文件

| 文件 | 说明 |
|------|------|
| `package.json` | 项目依赖与脚本配置 |
| `tsconfig.json` | TypeScript 编译设置 |
| `tailwind.config.js` | Tailwind CSS 配置 |
| `postcss.config.js` | PostCSS 配置 |
| `next.config.js` | Next.js 配置 |
| `wrangler.toml` | Cloudflare Pages 与 D1 绑定配置 |
| `.gitignore` | Git 忽略规则 |
| `README.md` | 项目说明与使用文档 |

### 核心功能文件

| 文件路径 | 功能说明 |
|---------|---------|
| `src/app/page.tsx` | 工具首页，展示所有功能入口 |
| `src/app/layout.tsx` | 根布局与全局样式、SEO 配置 |
| `src/app/houtai/page.tsx` | 后台管理系统页面 |
| `src/app/api/houtai/route.ts` | 后台 API 路由，处理管理操作 |
| `src/components/tools/` | 工具功能组件目录 |
| `src/components/ui/` | 通用 UI 组件目录 |
| `src/data/init.sql` | 数据库初始化脚本 |
| `src/data/schema.sql` | 数据库结构定义 |

## 🔧 工具列表

| 组件 | 功能 |
|------|------|
| `QRCodeGenerator` | 二维码生成 |
| `PasswordGenerator` | 安全密码生成 |
| `TextTools` | 文本处理工具 |
| `PDFConverter` | PDF 转换工具 |
| `ImageProcessor` | 图片处理工具 |

## 🗄️ 数据库表

| 表名 | 说明 |
|------|------|
| `admins` | 管理员账号表 |
| `site_content` | 站点内容存储 |
| `operation_logs` | 操作日志记录 |
| `settings` | 系统配置 |
| `user_records` | 用户使用记录 |
| `favorites` | 收藏内容记录 |

## 🚀 快速启动

### 安装依赖

```bash
npm install
```

### 启动开发服务器

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

## 🔐 后台管理

后台入口： `http://localhost:3000/houtai`

后台 API： `/api/houtai`

默认管理员账号（如已初始化数据库）：

- 用户名：`admin`
- 密码：`admin123`

## 📝 注意

- 后台路径已经从 `/admin` 更新为 `/houtai`
- API 路径已从 `/api/admin` 更新为 `/api/houtai`
- 文档内容已同步为当前项目结构和路由配置

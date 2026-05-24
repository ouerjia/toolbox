param(
    [string]$command = "build"
)

Write-Host "工具箱部署脚本" -ForegroundColor Cyan
Write-Host "=================`n" -ForegroundColor Cyan

switch ($command) {
    "build" {
        Write-Host "开始构建项目..." -ForegroundColor Green
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n构建成功！" -ForegroundColor Green
        } else {
            Write-Host "`n构建失败！" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }

    "deploy" {
        Write-Host "开始部署到 Cloudflare Pages..." -ForegroundColor Green
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "构建失败！" -ForegroundColor Red
            exit $LASTEXITCODE
        }
        
        Write-Host "`n上传到 Cloudflare Pages..." -ForegroundColor Green
        wrangler pages deploy .vercel/output/static
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n部署成功！" -ForegroundColor Green
        } else {
            Write-Host "`n部署失败！" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }

    "d1:create" {
        Write-Host "创建 D1 数据库..." -ForegroundColor Green
        wrangler d1 create toolbox-db
    }

    "d1:migrate" {
        Write-Host "执行数据库迁移..." -ForegroundColor Green
        wrangler d1 execute toolbox-db --file=./src/data/schema.sql
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n数据库迁移成功！" -ForegroundColor Green
        } else {
            Write-Host "`n数据库迁移失败！" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }

    "dev" {
        Write-Host "启动开发服务器..." -ForegroundColor Green
        npm run dev
    }

    default {
        Write-Host "未知命令: $command" -ForegroundColor Red
        Write-Host "`n可用命令:" -ForegroundColor Cyan
        Write-Host "  build      - 构建项目"
        Write-Host "  deploy     - 构建并部署到 Cloudflare Pages"
        Write-Host "  d1:create  - 创建 D1 数据库"
        Write-Host "  d1:migrate - 执行数据库迁移"
        Write-Host "  dev        - 启动开发服务器"
        exit 1
    }
}

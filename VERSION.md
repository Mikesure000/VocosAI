# VocosAI 版本记录

## v2.0.0 — 部署到 meetmore.cc (2026-06-06)

### 部署架构
```
前端: GitHub Pages → vocos.meetmore.cc (静态站点)
后端: Render.com → api.meetmore.cc (Docker容器)
数据库: Render.com 持久磁盘 SQLite
CI/CD: GitHub Actions 自动部署
```

### 部署配置
- ✅ `frontend/index.html` — API地址注入（开发/生产自动切换）
- ✅ `frontend/vite.config.ts` — 生产构建优化（vendor/mui/charts/motion代码分割）
- ✅ `backend/Dockerfile` — Docker容器化 + 启动自动建表+Seed
- ✅ `backend/render.yaml` — Render.com 服务配置
- ✅ `.github/workflows/deploy.yml` — GitHub Actions CI/CD
  - 自动注入 `window.VOCOS_API_BASE = https://api.meetmore.cc`
  - 自动生成 `CNAME` → `vocos.meetmore.cc`
  - GitHub Pages 部署

### 构建验证
```
✅ 前端生产构建成功：48个文件
   vendor: 163KB | mui: 374KB | charts: 410KB | motion: 125KB
   每个页面: 1-7KB 懒加载
✅ 代码分割: vendor/mui/charts/motion 独立chunk
✅ 全局错误处理 + 优雅关闭 + 进程守护
```

### 部署步骤
1. `git push origin main` → GitHub Actions 自动构建
2. 前端部署到 `vocos.meetmore.cc`（GitHub Pages）
3. 后端部署到 `api.meetmore.cc`（Render.com Docker）
4. DNS 已配置：vocos.meetmore.cc CNAME → Mikesure000.github.io

---

## v1.9.0 — 稳定性 (2026-06-06)
## v1.8.0 — 用户体验修复 (2026-06-06)
## v1.7.0 — Skill学习引擎 (2026-06-06)
## v1.6.0 — Agent+Skill架构 (2026-06-06)
## v1.5.0 ~ v0.1.0 (2026-06-05~06)

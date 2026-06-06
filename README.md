# VocosAI — Voice of Consumer OS

> ⚠️ **此仓库已迁移至 [Mikesure000/vocos.meetmore.cc](https://github.com/Mikesure000/vocos.meetmore.cc)**  
> 在线地址: [https://vocos.meetmore.cc](https://vocos.meetmore.cc)

> 基于 AI 大模型的消费者评论驱动内容策略生产系统

## 项目简介

VocosAI 是一个以 DeepSeek、OpenAI 等 AI 大模型为核心能力底座的 SaaS 平台。用户上传抖音/小红书内容和评论文件后，系统通过 17 个 AI Agent 自动完成：

```
评论清洗 → 内容拆解 → 评论洞察 → 内容归因 → 策略卡 → 内容生产卡 → 评论区运营 → 投流适配 → 发布质检 → 报告导出
```

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React 18, TypeScript 5, Vite 5, MUI 5, Tailwind CSS 3, Zustand, React Query, React Router 6 |
| 后端 | Node.js 22, Fastify 4, Prisma 5, SQLite, JWT, bcrypt |
| AI | DeepSeek v4, OpenAI GPT-4.1, 17 Agent 工作流, Model Gateway |
| 部署 | Docker, GitHub Actions |

## 快速开始

### 1. 一键安装

```bash
# Windows
setup.cmd
```

### 2. 启动服务

```bash
start.cmd
```

### 3. 访问

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 API | http://localhost:8787 |

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@vocosai.com | admin123 |
| 演示用户 | demo@vocosai.com | demo123 |

### 停止服务

```bash
stop.cmd
```

## 项目结构

```
vocosai/
├── frontend/              # React 18 + TypeScript 前端
│   └── src/
│       ├── app/           # 路由、布局、主题、认证
│       ├── features/      # 30+ 功能页面
│       │   ├── auth/      # 登录/注册
│       │   ├── workspace/ # 工作台
│       │   ├── project/   # 项目管理
│       │   ├── task/      # 任务创建/字段映射/分析进度
│       │   ├── analysis/  # 内容拆解/评论清洗
│       │   ├── insights/  # 评论洞察/高价值/需求地图/障碍地图/归因
│       │   ├── strategy/  # 策略卡/生产卡
│       │   ├── adfit/     # 投流适配
│       │   ├── qa/        # 发布前质检
│       │   ├── report/    # 报告中心/预览
│       │   ├── brand/     # 品牌管理/知识库
│       │   ├── admin/     # 管理后台
│       │   ├── collaborate/ # 团队协作
│       │   ├── compare/   # 多内容对比
│       │   ├── export/    # 导出中心
│       │   └── settings/  # 设置
│       └── shared/        # 共享组件/API/类型
├── backend/               # Node.js + Fastify 后端
│   ├── prisma/            # 数据库 Schema + Seed
│   └── src/
│       ├── config/        # 环境变量/Prisma 客户端
│       ├── middleware/     # JWT 认证/RBAC
│       └── modules/
│           ├── auth/      # 认证模块
│           ├── project/   # 项目 CRUD
│           ├── task/      # 任务管理 + 文件上传
│           ├── comment/   # 评论信号/抖音解析器
│           ├── insight/   # 内容拆解/洞察/归因
│           ├── strategy/  # 策略卡/生产卡
│           ├── report/    # 报告生成/导出(6格式)
│           ├── ai/        # Model Gateway + 17 Agent + 治理
│           ├── admin/     # 管理后台
│           └── team/      # 团队管理
├── setup.cmd              # 一键安装
├── start.cmd              # 启动服务
├── stop.cmd               # 停止服务
├── docker-compose.yml     # Docker 部署
├── VERSION.md             # 版本记录
└── README.md
```

## API 端点 (部分)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/register | 注册 |
| GET/POST | /api/projects | 项目 CRUD |
| GET/POST | /api/tasks | 任务 CRUD |
| POST | /api/tasks/:id/upload | 上传评论文件 |
| POST | /api/tasks/:id/confirm-mapping | 确认映射+入库 |
| POST | /api/tasks/:id/start | 启动 AI 分析 |
| GET | /api/tasks/:id/status | 分析进度 |
| GET | /api/tasks/:id/content-analysis | 内容拆解 |
| GET | /api/tasks/:id/comment-cleaning | 评论清洗 |
| GET | /api/tasks/:id/demand-map | 需求地图 |
| GET | /api/tasks/:id/barrier-map | 障碍地图 |
| GET | /api/tasks/:id/attribution | 内容归因 |
| GET/POST | /api/tasks/:id/strategy-cards | 策略卡 |
| POST | /api/reports/:id/export | 导出报告 |
| GET | /api/admin/ai/cost-summary | 成本汇总 |
| GET | /api/admin/ai/quality-summary | 质量评估 |

## 部署

### Docker

```bash
docker-compose up -d
```

### GitHub Pages (前端) + Render.com (后端)

详见 `.github/workflows/` 中的 CI/CD 配置。

## 版本

当前版本: **v0.5.0** — 查看 [VERSION.md](VERSION.md) 了解完整版本记录。

## 许可证

Private — All Rights Reserved

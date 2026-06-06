# VocosAI 部署指南

## 本地部署

### 前置条件
- Node.js 22+
- npm 9+

### 一键安装
```bash
setup.cmd
```

### 启动
```bash
start.cmd
# 前端: http://localhost:5173
# 后端: http://localhost:8787
```

### 停止
```bash
stop.cmd
```

---

## Docker 部署

```bash
docker-compose up -d
```

后端将在 8787 端口运行，数据存储在 `./backend/data/` 目录。

---

## GitHub 推送指南

### 首次推送

```bash
cd E:\CodeBuddy\VocosAI
git init
git add .
git commit -m "v0.5.0 - VocosAI initial release"
git branch -M main
git remote add origin https://github.com/Mikesure000/VocosAI.git
git push -u origin main
```

### 后续推送

```bash
git add .
git commit -m "描述本次改动"
git push
```

---

## 环境变量说明

后端 `.env` 文件配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 8787 |
| DATABASE_URL | SQLite 路径 | file:./data/vocosai.sqlite |
| JWT_SECRET | JWT 密钥 | 开发环境有默认值 |
| VOCOS_MODEL_MODE | AI 模式 (mock/live) | mock |
| DEEPSEEK_API_KEY | DeepSeek API Key | 空 (mock模式无需) |
| OPENAI_API_KEY | OpenAI API Key | 空 (mock模式无需) |

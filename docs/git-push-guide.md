# Git 推送指南

## 前置条件

安装 Git for Windows: https://git-scm.com/download/win

安装后打开终端执行：

```bash
# 配置用户信息
git config --global user.name "Mikesure000"
git config --global user.email "your-email@example.com"

# 进入项目目录
cd E:\CodeBuddy\VocosAI

# 首次提交推送
git add .
git commit -m "v0.5.0 - VocosAI: Voice of Consumer OS initial release"
git push -u origin main
```

## 后续迭代推送

```bash
cd E:\CodeBuddy\VocosAI
git add .
git commit -m "v0.6.0 - 描述改动"
git push
```

## 版本记录查看

```bash
git log --oneline
```

## 远程仓库

https://github.com/Mikesure000/VocosAI

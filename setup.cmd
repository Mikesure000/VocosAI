@echo off
REM VocosAI 一键还原/安装脚本
REM 运行此脚本即可从零搭建完整开发环境

echo ========================================
echo   VocosAI - Voice of Consumer OS
echo   一键安装脚本
echo ========================================
echo.

REM 检测 Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 未检测到 Node.js，请先安装 Node.js 22+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js 已安装
node --version
echo.

REM 安装根目录依赖
echo [1/4] 安装根目录依赖...
cd /d "%~dp0"
call npm install --silent 2>nul

REM 安装前端依赖
echo [2/4] 安装前端依赖...
cd /d "%~dp0frontend"
call npm install 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] 前端依赖安装有警告，继续...
)

REM 安装后端依赖
echo [3/4] 安装后端依赖...
cd /d "%~dp0backend"
call npm install 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] 后端依赖安装有警告，继续...
)

REM 初始化数据库
echo [4/4] 初始化数据库...
call npx prisma generate
call npx prisma db push
call npx tsx prisma/seed.ts
echo.

echo ========================================
echo   安装完成！
echo ========================================
echo.
echo 运行 start.cmd 启动服务
echo   前端: http://localhost:5173
echo   后端: http://localhost:8787
echo.
echo 测试账号:
echo   管理员: admin@vocosai.com / admin123
echo   演示用户: demo@vocosai.com / demo123
echo.
pause

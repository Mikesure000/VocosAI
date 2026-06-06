@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title VocosAI Server

set "NODE=C:\Users\daxia\.workbuddy\binaries\node\versions\22.22.2\node.exe"
set "BACKEND_DIR=%~dp0backend"
set "FRONTEND_DIR=%~dp0frontend"

echo ========================================
echo   VocosAI - Voice of Consumer OS
echo   进程守护模式 v2.0
echo ========================================
echo.

:: 检查 Node.js
if not exist "%NODE%" (
    echo [ERROR] Node.js not found: %NODE%
    pause
    exit /b 1
)

echo [OK] Node.js: %NODE%

:: 启动后端（进程守护）
echo [1/2] Starting backend (port 8787)...
start "VocosAI-Backend" /MIN cmd /c "cd /d %BACKEND_DIR% && :loop && echo [%date% %time%] Backend starting... && "%NODE%" --import tsx src/index.ts && echo [%date% %time%] Backend crashed, restarting in 3s... && timeout /t 3 /nobreak >nul && goto loop"

:: 等待后端就绪
echo Waiting for backend...
:wait_backend
timeout /t 2 /nobreak >nul
"%NODE%" -e "var h=require('http');h.get('http://localhost:8787/api/health',function(r){process.exit(0)}).on('error',function(){process.exit(1)});setTimeout(function(){process.exit(1)},3000)" >nul 2>&1
if errorlevel 1 goto wait_backend
echo [OK] Backend is ready

:: 启动前端（进程守护）
echo [2/2] Starting frontend (port 5173)...
start "VocosAI-Frontend" /MIN cmd /c "cd /d %FRONTEND_DIR% && :loop && echo [%date% %time%] Frontend starting... && "%NODE%" node_modules/vite/bin/vite.js --port 5173 && echo [%date% %time%] Frontend crashed, restarting in 3s... && timeout /t 3 /nobreak >nul && goto loop"

:: 等待前端就绪
echo Waiting for frontend...
:wait_frontend
timeout /t 2 /nobreak >nul
"%NODE%" -e "var h=require('http');h.get('http://localhost:5173',function(r){process.exit(0)}).on('error',function(){process.exit(1)});setTimeout(function(){process.exit(1)},3000)" >nul 2>&1
if errorlevel 1 goto wait_frontend

echo.
echo ========================================
echo   VocosAI is running!
echo ========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8787
echo.
echo   Admin: admin@vocosai.com / admin123
echo   Demo:  demo@vocosai.com / demo123
echo.
echo   [守护模式] 崩溃自动重启
echo   [停止] 运行 stop.cmd 或关闭窗口
echo ========================================
echo.

:: 保持窗口打开
pause >nul

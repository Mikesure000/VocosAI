@echo off
echo Stopping VocosAI...
taskkill /fi "WINDOWTITLE eq VocosAI-Backend*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq VocosAI-Frontend*" /f >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo All services stopped.

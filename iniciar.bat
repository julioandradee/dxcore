@echo off
title DXCore - Servidor Local
chcp 65001 >nul

echo ====================================================
echo        Iniciando DXCore Localmente
echo ====================================================
echo.

cd /d "%~dp0\src\PKHeX.Web.React"

echo [1/2] Verificando dependencias npm...
if not exist "node_modules" (
    echo Instalando dependencias do Node...
    call npm install
)

echo.
echo [2/2] Iniciando servidor em http://localhost:5173/ ...
echo Pressione Ctrl+C para encerrar o servidor.
echo.

REM Abre o navegador automaticamente apos 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173/"

call npx vite
pause


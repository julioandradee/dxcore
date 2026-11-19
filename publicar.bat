@echo off
title DXCore - Publicador Automático
chcp 65001 >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publicar.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] O processo foi interrompido ou ocorreu um erro.
)

echo.
pause

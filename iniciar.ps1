# Script PowerShell para iniciar o DXCore localmente
$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       Iniciando DXCore Localmente" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\src\PKHeX.Web.React"

if (-not (Test-Path "node_modules")) {
    Write-Host "[1/2] Instalando dependências npm..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[1/2] Dependências npm verificadas." -ForegroundColor Green
}

Write-Host "`n[2/2] Iniciando servidor Vite em http://localhost:5173/ ..." -ForegroundColor Green
Write-Host "Pressione Ctrl+C para encerrar o servidor.`n" -ForegroundColor DarkGray

# Abre o navegador automaticamente
Start-Process "http://localhost:5173/"

npx vite


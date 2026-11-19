# Script PowerShell para publicar o projeto no GitHub Pages
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       PUBLICADOR AUTOMÁTICO - GITHUB PAGES         " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Verifica se o Git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERRO] Git não encontrado no PATH do sistema. Instale o Git e tente novamente." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

# Obtém usuário e repositório a partir do git remote
$origin = git remote get-url origin 2>$null
$User = "julioandradee"
$DefaultRepo = "dxcore"

if ($origin -and $origin -match 'github\.com[:/]([^/]+)/([^/.]+)') {
    $User = $matches[1]
    $DefaultRepo = $matches[2]
}

# 1. Pergunta o nome do projeto
Write-Host "Usuário detectado no GitHub: " -NoNewline
Write-Host $User -ForegroundColor Yellow
$inputProject = Read-Host "Informe o nome do projeto no GitHub [Padrão: $DefaultRepo]"
$Project = if ([string]::IsNullOrWhiteSpace($inputProject)) { $DefaultRepo } else { $inputProject.Trim() }

$targetUrl = "https://$User.github.io/$Project/"
Write-Host ""
Write-Host "URL final da publicação: " -NoNewline
Write-Host $targetUrl -ForegroundColor Green
Write-Host ""

# 2. Confirmação
$confirm = Read-Host "Deseja continuar com a publicação? (S/N) [Padrão: S]"
if (-not [string]::IsNullOrWhiteSpace($confirm) -and $confirm.Trim().ToUpper() -ne "S") {
    Write-Host "`nOperação cancelada pelo usuário." -ForegroundColor Yellow
    exit 0
}

# 3. Ajusta o caminho base no vite.config.ts e workflow se necessário
$viteConfigPath = Join-Path $ScriptDir "src\PKHeX.Web.React\vite.config.ts"
if (Test-Path $viteConfigPath) {
    $content = Get-Content $viteConfigPath -Raw -Encoding UTF8
    $newContent = [regex]::Replace($content, "(\?\s*')\/[^\/']+\/(')", "`${1}/$Project/`${2}")
    if ($newContent -ne $content) {
        Set-Content -Path $viteConfigPath -Value $newContent -Encoding UTF8
        Write-Host "[Config] Base path atualizado em vite.config.ts para '/$Project/'." -ForegroundColor DarkGray
    }
}

$workflowPath = Join-Path $ScriptDir ".github\workflows\pkhex-web.yml"
if (Test-Path $workflowPath) {
    $content = Get-Content $workflowPath -Raw -Encoding UTF8
    $newContent = [regex]::Replace($content, "(VITE_BASE_PATH:\s*\/)[^\/\s]+(\/)", "`${1}$Project`${2}")
    if ($newContent -ne $content) {
        Set-Content -Path $workflowPath -Value $newContent -Encoding UTF8
        Write-Host "[Config] VITE_BASE_PATH atualizado em pkhex-web.yml para '/$Project/'." -ForegroundColor DarkGray
    }
}

# Atualiza remote se o nome do projeto for diferente
$expectedRemote = "https://github.com/$User/$Project.git"
if ($origin -ne $expectedRemote) {
    git remote set-url origin $expectedRemote 2>$null
}

# 4. Git Add, Commit e Push
Write-Host "`n[1/3] Enviando alterações locais para o GitHub..." -ForegroundColor Cyan
git add -A

$hasChanges = git status --porcelain
if ($hasChanges) {
    git commit -m "deploy: publicar projeto $Project" | Out-Null
    Write-Host "Alterações locais incluídas no commit de deploy." -ForegroundColor DarkGray
} else {
    Write-Host "Nenhuma alteração de código pendente." -ForegroundColor DarkGray
}

Write-Host "Executando git push origin main..." -ForegroundColor DarkGray
$pushResult = git push origin main 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao enviar para o GitHub:" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit 1
}

$sha = (git rev-parse HEAD).Trim()
Write-Host "Commit $sha enviado com sucesso!" -ForegroundColor Green

# 5. Monitora a compilação no GitHub Actions
Write-Host "`n[2/3] Aguardando compilação no GitHub Actions..." -ForegroundColor Cyan
Write-Host "Isso geralmente leva entre 1 e 2 minutos. Aguarde..." -ForegroundColor DarkGray

$maxWaitSeconds = 240
$elapsed = 0
$checkInterval = 7
$workflowFinished = $false
$workflowSuccess = $false
$runUrl = "https://github.com/$User/$Project/actions"

while ($elapsed -lt $maxWaitSeconds) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    try {
        $apiUri = "https://api.github.com/repos/$User/$Project/actions/runs?head_sha=$sha"
        $res = Invoke-RestMethod -Uri $apiUri -TimeoutSec 10 -ErrorAction SilentlyContinue
        $run = $res.workflow_runs | Where-Object { $_.name -eq "PKHeX.Web" } | Select-Object -First 1
        
        if ($run) {
            $runUrl = $run.html_url
            if ($run.status -eq "completed") {
                $workflowFinished = $true
                if ($run.conclusion -eq "success") {
                    $workflowSuccess = $true
                }
                break
            } else {
                Write-Host -NoNewline "."
            }
        } else {
            Write-Host -NoNewline "."
        }
    } catch {
        Write-Host -NoNewline "."
    }
}

Write-Host ""
if ($workflowFinished) {
    if ($workflowSuccess) {
        Write-Host "Build e Deploy no GitHub Actions concluídos com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "[AVISO] O fluxo no GitHub Actions terminou com falha." -ForegroundColor Red
        Write-Host "Acesse o log em: $runUrl" -ForegroundColor Yellow
    }
} else {
    Write-Host "Tempo limite de monitoramento do Actions atingido. Verificando URL diretamente..." -ForegroundColor Yellow
}

# 6. Verifica a disponibilidade online do URL
Write-Host "`n[3/3] Verificando disponibilidade online da página..." -ForegroundColor Cyan

$online = $false
for ($attempt = 1; $attempt -le 15; $attempt++) {
    try {
        $resp = Invoke-WebRequest -Uri $targetUrl -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($resp -and $resp.StatusCode -eq 200) {
            $online = $true
            break
        }
    } catch {
        # Aguardando propagação dos servidores CDN
    }
    Start-Sleep -Seconds 4
    Write-Host -NoNewline "."
}

Write-Host ""
if ($online) {
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host "         PROJETO PUBLICADO COM SUCESSO!             " -ForegroundColor Green
    Write-Host "====================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "A página já está disponível e respondendo online em:" -ForegroundColor White
    Write-Host "👉 $targetUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "====================================================" -ForegroundColor Yellow
    Write-Host "               PROCESSO CONCLUÍDO                   " -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O deploy foi finalizado. Caso a página ainda não abra de imediato," -ForegroundColor White
    Write-Host "aguarde de 1 a 2 minutos para a propagação da CDN do GitHub Pages." -ForegroundColor White
    Write-Host "URL do projeto:" -ForegroundColor White
    Write-Host "👉 $targetUrl" -ForegroundColor Cyan
}

Write-Host ""
$openBrowser = Read-Host "Deseja abrir a página no navegador agora? (S/N) [Padrão: S]"
if ([string]::IsNullOrWhiteSpace($openBrowser) -or $openBrowser.Trim().ToUpper() -eq "S") {
    Start-Process $targetUrl
}

Write-Host "`nConcluído com sucesso!" -ForegroundColor Green
Start-Sleep -Seconds 2

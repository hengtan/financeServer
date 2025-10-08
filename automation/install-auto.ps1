# ═══════════════════════════════════════════════════════════════
#   INSTALAÇÃO AUTOMÁTICA - Sistema de Ponto
#   Execute como Administrador!
# ═══════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   INSTALAÇÃO AUTOMÁTICA" -ForegroundColor Cyan
Write-Host "   Sistema de Automação de Ponto" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Cyan

# Verificar se está rodando como Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERRO: Execute como Administrador!" -ForegroundColor Red
    Write-Host "`nClique direito neste arquivo → 'Executar com PowerShell como Administrador'`n" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Executando como Administrador`n" -ForegroundColor Green

# Função para verificar comando
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Função para download
function Download-File {
    param($Url, $Output)
    Write-Host "   Baixando: $Url" -ForegroundColor Gray
    try {
        Invoke-WebRequest -Uri $Url -OutFile $Output -UseBasicParsing
        return $true
    }
    catch {
        Write-Host "   ❌ Erro ao baixar: $_" -ForegroundColor Red
        return $false
    }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "ETAPA 1: Verificando Node.js" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Yellow

$nodeInstalled = Test-Command "node"

if ($nodeInstalled) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js já instalado: $nodeVersion`n" -ForegroundColor Green
}
else {
    Write-Host "❌ Node.js NÃO encontrado`n" -ForegroundColor Red
    Write-Host "Escolha o método de instalação:" -ForegroundColor Yellow
    Write-Host "1. Chocolatey (recomendado - mais rápido)"
    Write-Host "2. Download manual do instalador oficial`n"

    $choice = Read-Host "Escolha (1 ou 2)"

    if ($choice -eq "1") {
        # Instalar via Chocolatey
        Write-Host "`nVerificando Chocolatey..." -ForegroundColor Yellow

        if (-not (Test-Command "choco")) {
            Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

            # Recarregar PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        }

        Write-Host "Instalando Node.js via Chocolatey..." -ForegroundColor Yellow
        choco install nodejs-lts -y

        # Recarregar PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        Write-Host "✅ Node.js instalado!`n" -ForegroundColor Green
    }
    elseif ($choice -eq "2") {
        # Download manual
        Write-Host "`nBaixando Node.js..." -ForegroundColor Yellow
        $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
        $nodeInstaller = "$env:TEMP\node-installer.msi"

        if (Download-File $nodeUrl $nodeInstaller) {
            Write-Host "Instalando Node.js..." -ForegroundColor Yellow
            Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait

            # Recarregar PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

            Write-Host "✅ Node.js instalado!`n" -ForegroundColor Green
            Remove-Item $nodeInstaller -Force
        }
        else {
            Write-Host "❌ Falha ao instalar Node.js" -ForegroundColor Red
            Write-Host "Instale manualmente: https://nodejs.org/`n" -ForegroundColor Yellow
            pause
            exit 1
        }
    }
    else {
        Write-Host "Opção inválida. Execute novamente.`n" -ForegroundColor Red
        pause
        exit 1
    }
}

# Verificar novamente
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js não foi instalado corretamente" -ForegroundColor Red
    Write-Host "Feche e abra um novo PowerShell e tente novamente`n" -ForegroundColor Yellow
    pause
    exit 1
}

# ═══════════════════════════════════════════════════════════════
Write-Host "ETAPA 2: Instalando Dependências" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Yellow

Write-Host "Instalando pacotes npm..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências npm`n" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ Dependências npm instaladas`n" -ForegroundColor Green

Write-Host "Instalando Playwright..." -ForegroundColor Gray
npx playwright install chromium
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar Playwright`n" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ Playwright instalado`n" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════
Write-Host "ETAPA 3: Verificando Sistema" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Yellow

node verify-system.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Verificação falhou. Revise os erros acima.`n" -ForegroundColor Yellow
    pause
    exit 1
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`nETAPA 4: Configuração Inicial" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Yellow

Write-Host "Verificando sessão Microsoft..." -ForegroundColor Gray
if (Test-Path "prodesp-session.json") {
    Write-Host "✅ Sessão já existe`n" -ForegroundColor Green
}
else {
    Write-Host "❌ Sessão NÃO encontrada`n" -ForegroundColor Red
    Write-Host "ATENÇÃO: Você precisará fazer login e aprovar 2FA no celular!`n" -ForegroundColor Yellow
    $doLogin = Read-Host "Fazer login agora? (S/N)"

    if ($doLogin -eq "S" -or $doLogin -eq "s") {
        Write-Host "`nIniciando login..." -ForegroundColor Yellow
        Write-Host "Navegador vai abrir. Aprove o 2FA no celular!`n" -ForegroundColor Cyan
        node prodesp-save-session.js

        if (Test-Path "prodesp-session.json") {
            Write-Host "`n✅ Sessão salva com sucesso!`n" -ForegroundColor Green
        }
        else {
            Write-Host "`n❌ Sessão não foi salva. Execute novamente:`n" -ForegroundColor Red
            Write-Host "   node prodesp-save-session.js`n" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "`n⚠️  Lembre-se de executar depois:`n" -ForegroundColor Yellow
        Write-Host "   node prodesp-save-session.js`n" -ForegroundColor Gray
    }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "ETAPA 5: Configurando Agendamento" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Yellow

$createTasks = Read-Host "Criar tarefas agendadas? (S/N)"

if ($createTasks -eq "S" -or $createTasks -eq "s") {
    Write-Host "`nCriando tarefas..." -ForegroundColor Yellow
    node setup-windows-tasks.js

    Write-Host "`n✅ Tarefas criadas!`n" -ForegroundColor Green
    Write-Host "Tarefas agendadas:" -ForegroundColor Cyan
    Write-Host "  📍 Entrada: Segunda a Sexta, 8:50" -ForegroundColor Gray
    Write-Host "  📍 Saída: Segunda a Sexta, 18:00`n" -ForegroundColor Gray
}
else {
    Write-Host "`n⚠️  Execute depois:`n" -ForegroundColor Yellow
    Write-Host "   node setup-windows-tasks.js`n" -ForegroundColor Gray
}

# ═══════════════════════════════════════════════════════════════
Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ INSTALAÇÃO COMPLETA!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "📊 RESUMO:" -ForegroundColor Cyan
Write-Host "  ✅ Node.js instalado" -ForegroundColor Green
Write-Host "  ✅ Dependências instaladas" -ForegroundColor Green
Write-Host "  ✅ Sistema verificado" -ForegroundColor Green

if (Test-Path "prodesp-session.json") {
    Write-Host "  ✅ Sessão Microsoft configurada" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Sessão Microsoft PENDENTE" -ForegroundColor Yellow
}

if ($createTasks -eq "S" -or $createTasks -eq "s") {
    Write-Host "  ✅ Tarefas agendadas criadas" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  Tarefas agendadas PENDENTES" -ForegroundColor Yellow
}

Write-Host "`n📝 PRÓXIMOS PASSOS:" -ForegroundColor Cyan

if (-not (Test-Path "prodesp-session.json")) {
    Write-Host "  1. Executar: node prodesp-save-session.js" -ForegroundColor Yellow
}

if ($createTasks -ne "S" -and $createTasks -ne "s") {
    Write-Host "  2. Executar: node setup-windows-tasks.js" -ForegroundColor Yellow
}

Write-Host "`n🔍 VERIFICAR FERIADOS:" -ForegroundColor Cyan
Write-Host "   node manage-holidays.js list 2025`n" -ForegroundColor Gray

Write-Host "📂 LOGS:" -ForegroundColor Cyan
Write-Host "   logs\timesheet-YYYY-MM-DD.log`n" -ForegroundColor Gray

Write-Host "🎯 TESTE MANUAL:" -ForegroundColor Cyan
Write-Host "   node run-timesheet.js`n" -ForegroundColor Gray

Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Green

pause

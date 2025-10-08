@echo off
:: ═══════════════════════════════════════════════════════════════
::   INSTALADOR AUTOMÁTICO - Sistema de Ponto
::   Duplo-clique para instalar tudo automaticamente!
:: ═══════════════════════════════════════════════════════════════

title Instalacao Automatica - Sistema de Ponto

echo.
echo ═══════════════════════════════════════════════════════════════
echo    INSTALADOR AUTOMATICO
echo    Sistema de Automacao de Ponto
echo ═══════════════════════════════════════════════════════════════
echo.

:: Verificar se está rodando como Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [31m ERRO: Precisa de permissoes de Administrador![0m
    echo.
    echo Clique direito neste arquivo e escolha:
    echo "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo [32m Executando como Administrador[0m
echo.

:: Executar script PowerShell
echo Iniciando instalacao...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0install-auto.ps1"

if %errorLevel% neq 0 (
    echo.
    echo [31m Erro durante a instalacao![0m
    echo.
    pause
    exit /b 1
)

echo.
echo [32m Instalacao concluida![0m
echo.
pause

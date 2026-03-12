@echo off
title GitHub Profile Auto Updater

echo =====================================
echo   Iniciando GitHub Profile Bot
echo =====================================

cd /d %~dp0

set REPO_CORRETO=https://github.com/RafaelaSommer/GitHub-Profile-Auto-Updater.git

echo.
echo Verificando repositorio...

git config --get remote.origin.url > temp_repo.txt
set /p REPO=<temp_repo.txt
del temp_repo.txt

echo Repositorio atual:
echo %REPO%
echo.

echo %REPO% | find "GitHub-Profile-Auto-Updater" >nul

if errorlevel 1 (
    echo ⚠️ Repositorio incorreto detectado
    echo Corrigindo automaticamente...

    git remote set-url origin %REPO_CORRETO%

    echo.
    echo ✅ Repositorio corrigido para:
    echo %REPO_CORRETO%
)

echo.
echo Instalando dependencias...
call npm install

echo.
echo Iniciando bot...
node scripts/bot-local.js

pause
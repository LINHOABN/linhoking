@echo off
title Administration - Mon E-commerce
chcp 65001 > nul
echo.
echo ╔════════════════════════════════════════╗
echo ║    ADMINISTRATION — Mon E-commerce     ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0admin-frontend"

if not exist "node_modules" (
    echo [1/2] Installation des dependances...
    call npm install
    if errorlevel 1 (
        echo ERREUR: npm install a echoue.
        pause
        exit /b 1
    )
    echo.
)

echo [2/2] Demarrage de l'interface admin sur http://localhost:5174
echo.
echo   Identifiant : admin
echo   Mot de passe : admin123
echo.
echo Ctrl+C pour arreter.
echo ───────────────────────────────────────────
echo.
call npm run dev
pause

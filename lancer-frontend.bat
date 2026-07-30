@echo off
title Boutique En Ligne - Frontend
echo ==========================================
echo Verification des dependances du Frontend...
echo ==========================================

:: Aller dans le bon dossier avec un chemin absolu
cd /d "D:\E LINHOKING\shop-frontend"

if not exist node_modules (
    echo node_modules absent. Installation en cours...
    call npm install
    call npm install @rolldown/binding-win32-x64-msvc
) else (
    if not exist node_modules\@rolldown\binding-win32-x64-msvc (
        echo Binaire natif Rolldown manquant. Installation...
        call npm install @rolldown/binding-win32-x64-msvc
    )
)

echo ==========================================
echo Demarrage du Frontend React (Vite)...
echo URL : http://localhost:5173
echo ==========================================
npm run dev

:fin
pause

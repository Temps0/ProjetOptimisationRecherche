@echo off
title Demarrage Projet Optimisation Recherche
echo ==========================================
echo Démarrage du Projet Optimisation Recherche
echo ==========================================

:: Aller dans le dossier du script
cd /d "%~dp0"

:: Lancer le serveur backend dans une nouvelle fenêtre
echo [1/2] Lancement du serveur backend...
start "Serveur Backend" cmd /k "cd server && node index.js"

:: Lancer le frontend dans une nouvelle fenêtre
echo [2/2] Lancement du frontend...
start "Serveur Frontend" cmd /k "cd Projet_optimisationRecherche && npm run dev"

echo.
echo Les serveurs ont été lancés dans des fenêtres distinctes.
echo Vous pouvez fermer cette fenêtre principale.
pause

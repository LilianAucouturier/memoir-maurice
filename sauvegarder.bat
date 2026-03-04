@echo off
echo ==============================================
echo   Sauvegarde Automatique vers GitHub
echo ==============================================
echo.

set /p message="Quel est le message de cette mise a jour ? (Appuie sur Entree pour mettre 'Mise a jour automatique'): "
if "%message%"=="" set message=Mise a jour automatique

echo.
echo [1/3] Ajout des fichiers modifiÃ©s...
git add .

echo.
echo [2/3] Creation de la sauvegarde locale...
git commit -m "%message%"

echo.
echo [3/3] Envoi des modifications sur Internet (GitHub)...
git push origin main

echo.
echo ==============================================
echo                 TERMINE !
echo ==============================================
pause

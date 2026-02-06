@echo off
echo ========================================
echo GitHub Upload Script for ShiKaraKa
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo [1/5] Initializing Git repository...
    git init
    echo Git initialized!
) else (
    echo [1/5] Git already initialized
)
echo.

REM Add all files
echo [2/5] Adding all files to Git...
git add .
echo Files added!
echo.

REM Create commit
echo [3/5] Creating commit...
git commit -m "Initial commit: ShiKaraKa Anime Portal - Complete React + TypeScript + Supabase application"
echo Commit created!
echo.

REM Ask for GitHub repository URL
echo [4/5] Please enter your GitHub repository URL
echo Example: https://github.com/username/shikaraka-anime-portal.git
set /p REPO_URL="Repository URL: "
echo.

REM Add remote
echo Adding remote repository...
git remote add origin %REPO_URL%
echo Remote added!
echo.

REM Push to GitHub
echo [5/5] Pushing to GitHub...
echo This may take a minute...
git branch -M main
git push -u origin main
echo.

echo ========================================
echo SUCCESS! Your code is now on GitHub!
echo ========================================
echo.
echo Next steps:
echo 1. Go to your GitHub repository
echo 2. Verify all files are uploaded
echo 3. Follow VERCEL_SETUP_GUIDE.md to deploy
echo.
pause

@echo off
echo ========================================
echo Fixing Git Configuration and Uploading
echo ========================================
echo.

REM Configure Git user
echo [1/4] Configuring Git user...
git config --global user.email "geygey123123@github.com"
git config --global user.name "geygey123123"
echo Git user configured!
echo.

REM Add all files again
echo [2/4] Adding all files...
git add .
echo Files added!
echo.

REM Create commit
echo [3/4] Creating commit...
git commit -m "Initial commit: ShiKaraKa Anime Portal - Complete React + TypeScript + Supabase application"
echo Commit created!
echo.

REM Push to GitHub
echo [4/4] Pushing to GitHub...
echo This may take a minute...
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo SUCCESS! Your code is now on GitHub!
    echo ========================================
    echo.
    echo Check it out: https://github.com/geygey123123/shikaraka-anime-portal
    echo.
    echo Next steps:
    echo 1. Go to your GitHub repository
    echo 2. Verify all files are uploaded
    echo 3. Follow VERCEL_SETUP_GUIDE.md to deploy
) else (
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
    echo.
    echo This might be because:
    echo 1. You need to authenticate with GitHub
    echo 2. The repository doesn't exist
    echo.
    echo Try using GitHub Desktop instead:
    echo https://desktop.github.com/
)
echo.
pause

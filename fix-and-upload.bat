@echo off
echo ========================================
echo Git Push to GitHub
echo ========================================
echo.

REM Configure Git user
echo [1/4] Configuring Git user...
git config user.email "geygey123123@github.com"
git config user.name "geygey123123"
echo Git user configured!
echo.

REM Add all files
echo [2/4] Adding all files...
git add .
echo Files added!
echo.

REM Create commit
echo [3/4] Creating commit...
git commit -m "Fix: Update padding and admin panel logic"
echo Commit created!
echo.

REM Push to GitHub
echo [4/4] Pushing to GitHub...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo SUCCESS! Changes pushed to GitHub
    echo ========================================
    echo.
    echo Vercel will auto-deploy in 1-2 minutes
    echo Check: https://github.com/geygey123123/shikaraka-anime-portal
) else (
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
    echo.
    echo Try: git push
)
echo.
pause

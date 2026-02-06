@echo off
echo ========================================
echo Full Repository Reset and Upload
echo ========================================
echo.
echo WARNING: This will DELETE all files on GitHub
echo and upload fresh copy from local!
echo.
echo Press Ctrl+C to cancel, or
pause
echo.

REM Configure Git user
echo [1/7] Configuring Git user...
git config --global user.email "geygey123123@github.com"
git config --global user.name "geygey123123"
echo Git user configured!
echo.

REM Remove all tracked files from Git (but keep locally)
echo [2/7] Removing all tracked files from Git...
git rm -r --cached .
echo Files removed from Git tracking!
echo.

REM Add all files fresh
echo [3/7] Adding all files fresh...
git add .
echo Files added!
echo.

REM Create commit
echo [4/7] Creating commit...
git commit -m "Full reset: ShiKaraKa Anime Portal with V2 Features Spec"
echo Commit created!
echo.

REM Force push to GitHub (overwrites everything)
echo [5/7] Force pushing to GitHub...
echo This will DELETE everything on GitHub and upload fresh!
echo.
git push -f origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo SUCCESS! Repository fully reset!
    echo ========================================
    echo.
    echo All old files deleted from GitHub
    echo Fresh copy uploaded successfully
    echo.
    echo Check it out: https://github.com/geygey123123/shikaraka-anime-portal
    echo.
    echo Next steps:
    echo 1. Verify all files on GitHub
    echo 2. Check .kiro/specs/shikaraka-v2-features/ for new features
    echo 3. Follow VERCEL_SETUP_GUIDE.md to redeploy
) else (
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
    echo.
    echo This might be because:
    echo 1. You need to authenticate with GitHub
    echo 2. The repository doesn't exist
    echo 3. You don't have force push permissions
    echo.
    echo Try using GitHub Desktop instead:
    echo https://desktop.github.com/
)
echo.
pause

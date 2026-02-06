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
    echo Check: https://github.com/geygey123123/shikaraka-anime-portal
    echo.
    echo Next: Check .kiro/specs/shikaraka-v2-features/ for new features
) else (
    echo ========================================
    echo ERROR: Authentication Failed!
    echo ========================================
    echo.
    echo GitHub needs Personal Access Token, not password!
    echo.
    echo SOLUTION 1 - Use GitHub Desktop:
    echo   1. Download: https://desktop.github.com/
    echo   2. Login to your account
    echo   3. Open this folder in GitHub Desktop
    echo   4. Click Push
    echo.
    echo SOLUTION 2 - Setup token:
    echo   Open GITHUB_TOKEN_SETUP.md file
    echo   Follow instructions to create token
    echo.
    echo Then run this script again!
)
echo.
pause

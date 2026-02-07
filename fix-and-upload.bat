@echo off
echo ========================================
echo ShiKaraKa - Build and Deploy
echo ========================================
echo.

echo [1/5] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b %errorlevel%
)
echo Build successful!
echo.

echo [2/5] Configuring Git user...
git config user.email "geygey123123@github.com"
git config user.name "geygey123123"
echo.

echo [3/5] Adding files to git...
git add .
echo.

echo [4/5] Committing changes...
git commit -m "fix: filters real-time update - implement handleFilterChange"
echo.

echo [5/5] Pushing to GitHub...
git push origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo SUCCESS! Deployed to Vercel
    echo ========================================
    echo.
    echo Vercel will auto-deploy in 1-2 minutes
    echo Check: https://github.com/geygey123123/shikaraka-anime-portal
) else (
    echo ========================================
    echo ERROR: Push failed
    echo ========================================
)
echo.
pause

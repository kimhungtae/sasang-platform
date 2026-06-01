@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Diagnostic Information
echo ==========================================
echo.

echo === 1. All local refs ===
dir /B .git\refs\heads
dir /B .git\refs\remotes 2>nul
echo.

echo === 2. What git sees on remote (ls-remote) ===
git ls-remote origin
echo.

echo === 3. Local commits ===
git log --all --oneline
echo.

echo === 4. Force push with VERBOSE ===
git push -v --force --set-upstream origin main:main
echo.

echo ==========================================
echo  Press any key to close...
pause >nul

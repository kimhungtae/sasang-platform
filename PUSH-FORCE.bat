@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  FORCE Push to GitHub
echo ==========================================
echo  This will FORCE upload local files to GitHub
echo  Safe because GitHub repo is empty.
echo ==========================================
echo.

echo === Step 1: Check local state ===
git log --oneline -3
echo.
git remote -v
echo.

echo === Step 2: Force push ===
git push -u origin main --force
echo.

echo ==========================================
if errorlevel 1 (
    echo  Push FAILED - send screenshot
) else (
    echo  Done! Check GitHub now:
    echo  https://github.com/kimhungtae/sasang-platform
    echo  (press Ctrl+F5 to hard refresh the page)
)
echo ==========================================
echo.
echo Press any key to close...
pause >nul

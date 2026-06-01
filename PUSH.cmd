@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Pushing to GitHub
echo ==========================================
echo.
echo If a browser opens, click "Authorize" to login.
echo.
git push -u origin main
echo.
echo ==========================================
if errorlevel 1 (
    echo  Push FAILED - see error above
) else (
    echo  Push SUCCESS!
    echo  Check: https://github.com/kimhungtae/sasang-platform
)
echo ==========================================
echo.
pause

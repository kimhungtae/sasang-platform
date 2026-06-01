@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Pushing sasang-platform to GitHub
echo ==========================================
echo  This should work without password prompt
echo  since authentication is already saved.
echo ==========================================
echo.

git push -u origin main

echo.
echo ==========================================
if errorlevel 1 (
    echo  Push FAILED - see error message above
    echo  Send a screenshot to chat please
) else (
    echo  SUCCESS! Files pushed to GitHub!
    echo  Check: https://github.com/kimhungtae/sasang-platform
    echo  Refresh the page to see all files
)
echo ==========================================
echo.
echo Press any key to close this window...
pause >nul

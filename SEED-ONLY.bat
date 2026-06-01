@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Seed v24 Only (Tables Already Exist)
echo ==========================================
echo.

call npm run seed:questionnaire
if errorlevel 1 (
    echo.
    echo ERROR: seed failed. See message above.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo  SUCCESS! v24 data seeded.
echo ==========================================
echo  Next: Run DEV.bat to view at localhost:3000/quiz
echo.
pause

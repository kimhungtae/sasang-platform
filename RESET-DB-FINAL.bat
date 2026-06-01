@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  v24-Platform Migration (30 questions)
echo ==========================================
echo  - 26 v21 questions + 4 Killer = 30 total
echo  - v24 scoring algorithm
echo  - v24-style result page
echo ==========================================
echo.

echo === Step 0: Kill any running Node processes ===
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM tsx.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo  Done.
echo.

echo === Step 1: Delete existing DB and migrations ===
if exist "db\sasang.db" del /F /Q "db\sasang.db" 2>nul
if exist "db\sasang.db-journal" del /F /Q "db\sasang.db-journal" 2>nul
if exist "db\migrations" rmdir /S /Q "db\migrations"
echo  Cleared.
echo.

echo === Step 2: Generate fresh migration ===
call npm run db:generate
if errorlevel 1 ( echo ERROR & pause & exit /b 1 )
echo.

echo === Step 3: Apply migration ===
call npm run db:migrate
if errorlevel 1 ( echo ERROR & pause & exit /b 1 )
echo.

echo === Step 4: Seed v24-platform questionnaire (30 questions) ===
call npm run seed:questionnaire
if errorlevel 1 ( echo ERROR & pause & exit /b 1 )
echo.

echo ==========================================
echo  SUCCESS! v24-platform DB ready.
echo ==========================================
echo  Next:
echo    1. Run DEV.bat to start server
echo    2. Test at http://localhost:3000/quiz
echo    3. Complete 30 questions
echo    4. Check result page (v24 format)
echo.
pause

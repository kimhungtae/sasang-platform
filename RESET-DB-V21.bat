@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  v21 Migration: Reset DB and Seed
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

echo === Step 4: Seed v21 questionnaire ===
call npm run seed:questionnaire
if errorlevel 1 ( echo ERROR & pause & exit /b 1 )
echo.

echo ==========================================
echo  SUCCESS! v21 DB ready.
echo ==========================================
echo  Next: Run DEV.bat to start server
echo  Then: http://localhost:3000/quiz
echo.
pause

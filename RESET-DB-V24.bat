@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  v24 Migration: Reset DB and Seed
echo ==========================================
echo.

echo === Step 0: Kill any running Node processes ===
echo  (releases DB file lock)
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM tsx.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo  Done.
echo.

echo === Step 1: Delete existing DB and migrations ===
if exist "db\sasang.db" (
    del /F /Q "db\sasang.db" 2>nul
    if exist "db\sasang.db" (
        echo   WARNING: sasang.db still locked. Trying to rename...
        ren "db\sasang.db" "sasang.db.old.%RANDOM%" 2>nul
    )
)
if exist "db\sasang.db-journal" del /F /Q "db\sasang.db-journal" 2>nul
if exist "db\sasang.db-wal" del /F /Q "db\sasang.db-wal" 2>nul
if exist "db\sasang.db-shm" del /F /Q "db\sasang.db-shm" 2>nul
if exist "db\migrations" rmdir /S /Q "db\migrations"
echo  Cleared.
echo.

echo === Step 2: Generate fresh migration ===
call npm run db:generate
if errorlevel 1 (
    echo ERROR: generate failed
    pause
    exit /b 1
)
echo.

echo === Step 3: Apply migration ===
call npm run db:migrate
if errorlevel 1 (
    echo.
    echo ERROR: migrate failed
    echo.
    echo If "table already exists" error:
    echo   1. Close ALL cmd/PowerShell windows
    echo   2. Open Task Manager (Ctrl+Shift+Esc)
    echo   3. End all "node.exe" processes
    echo   4. Run this batch again
    pause
    exit /b 1
)
echo.

echo === Step 4: Seed v24 questionnaire ===
call npm run seed:questionnaire
if errorlevel 1 (
    echo ERROR: seed failed
    pause
    exit /b 1
)
echo.

echo ==========================================
echo  SUCCESS! v24 DB ready.
echo ==========================================
echo  Next: Run DEV.bat to start the server
echo.
pause

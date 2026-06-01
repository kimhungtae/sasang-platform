@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  T2: Database Setup
echo ==========================================
echo.

echo === Step 1/3: Installing new dependencies ===
echo (drizzle-orm, better-sqlite3, zod, drizzle-kit, etc.)
echo This may take 1-3 minutes...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install failed. See message above.
    pause
    exit /b 1
)
echo.

echo === Step 2/3: Generating SQL migration file ===
call npm run db:generate
if errorlevel 1 (
    echo.
    echo ERROR: db:generate failed. See message above.
    pause
    exit /b 1
)
echo.

echo === Step 3/3: Applying migration (creating DB) ===
call npm run db:migrate
if errorlevel 1 (
    echo.
    echo ERROR: db:migrate failed. See message above.
    pause
    exit /b 1
)
echo.

echo ==========================================
echo  SUCCESS! Database created.
echo ==========================================
echo.
echo Files created:
echo  - db/sasang.db          (SQLite database)
echo  - db/migrations/        (SQL migration files)
echo.
echo You can verify by running: npm run db:studio
echo (opens a web UI to browse tables)
echo.
pause

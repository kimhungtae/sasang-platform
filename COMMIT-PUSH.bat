@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  T2 Work: Commit and Push to GitHub
echo ==========================================
echo.

echo === Step 1: Show what changed ===
git status --short
echo.

echo === Step 2: Stage all changes ===
git add -A
echo  Staged.
echo.

echo === Step 3: Create commit ===
git commit -m "feat(db): T2 - Drizzle schema, migrations, libsql client" -m "- Add 11 core tables (users, questionnaires, prescriptions, herbs, etc.)" -m "- Switch from better-sqlite3 to @libsql/client (no native compilation)" -m "- Configure drizzle-kit for migrations" -m "- Add .env.local with DATABASE_URL" -m "- Update .gitignore to exclude db/*.db"
echo.

echo === Step 4: Push to GitHub ===
git push origin main
if errorlevel 1 (
    echo.
    echo ERROR: Push failed. See message above.
    pause
    exit /b 1
)
echo.

echo ==========================================
echo  SUCCESS! T2 committed and pushed.
echo ==========================================
echo  Check: https://github.com/kimhungtae/sasang-platform
echo.
pause

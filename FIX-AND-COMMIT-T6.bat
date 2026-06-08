@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Fix git locks and Commit T6
echo ==========================================
echo.

echo === Removing stale git lock files ===
if exist ".git\index.lock" del /f /q ".git\index.lock" & echo  removed index.lock
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock" & echo  removed HEAD.lock
if exist ".git\refs\heads\main.lock" del /f /q ".git\refs\heads\main.lock" & echo  removed main.lock
echo  Locks cleared.
echo.

echo === Staging T6 files only ===
git add data/lifestyle.ts
git add "app/guide"
git add components/quiz/ResultView.tsx
git add CLAUDE.md
git add COMMIT-T6.bat
git add FIX-AND-COMMIT-T6.bat
echo  Staged.
echo.

echo === What will be committed ===
git status --short -- data/lifestyle.ts "app/guide" components/quiz/ResultView.tsx CLAUDE.md
echo.

echo === Commit ===
git commit -m "feat(guide): T6 - constitution lifestyle guide page" -m "Add /guide/[constitution] dynamic route with 4-section guide (food / exercise / emotion / caution): data/lifestyle.ts typed data for 4 constitutions, themed server-rendered page with key indicator + food chips + 404 guard, ResultView CTA to /guide/[top], and CLAUDE.md project doc."
echo.

echo === Push ===
git push origin main
if errorlevel 1 ( echo PUSH FAILED & pause & exit /b 1 )

echo.
echo ==========================================
echo  SUCCESS! T6 lifestyle guide pushed.
echo ==========================================
echo  https://github.com/kimhungtae/sasang-platform
echo.
pause

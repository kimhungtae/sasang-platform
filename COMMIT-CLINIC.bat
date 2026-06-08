@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Commit Phase 1 clinic feature + push
echo ==========================================
echo.

echo Clearing any stale git locks...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\refs\heads\main.lock" del /f /q ".git\refs\heads\main.lock"
echo.

echo Staging Phase 1 files...
git add .gitignore
git add CLAUDE.md
git add package.json
git add db/schema.ts
git add app/actions/intake.ts
git add app/intake/page.tsx
git add app/result/page.tsx
git add app/page.tsx
git add components/quiz/IntakeForm.tsx
git add components/quiz/ResultView.tsx
git add scripts/create-clinic-tables.ts
git add SETUP-CLINIC.bat
git add CREATE-CLINIC-TABLES.bat
git add COMMIT-CLINIC.bat
echo.

echo Committing...
git commit -m "feat(clinic): Phase 1 - patient intake (name/chart) and online save" -m "Add /intake entry (name+chartNo required, gender/age optional), patients + survey_records tables, saveIntakeRecord server action, and result-page auto-save to Turso (anonymous self-test unaffected)."
echo.

echo Pushing to GitHub (Vercel will auto-redeploy)...
git push origin main
if errorlevel 1 ( echo PUSH FAILED & pause & exit /b 1 )
echo.

echo ==========================================
echo  Done. Pushed. Vercel will redeploy.
echo ==========================================
echo.
pause

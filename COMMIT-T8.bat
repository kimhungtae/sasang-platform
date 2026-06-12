@echo off
chcp 65001 >nul
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Commit T8 (Ryu Ju-yeol 342 prescriptions) + push
echo ==========================================
echo.

echo Clearing any stale git locks...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\refs\heads\main.lock" del /f /q ".git\refs\heads\main.lock"
echo.

echo Staging T8 files...
git add CLAUDE.md
git add package.json
git add scripts/dump-prescriptions.ts
git add scripts/seed-prescriptions.ts
git add data/prescriptions-raw.json
git add DUMP-PRESCRIPTIONS.bat
git add SEED-PRESCRIPTIONS.bat
git add app/actions/clinic-record.ts
git add components/clinic/SecondStage.tsx
git add components/clinic/RecordView.tsx
git add "app/clinic/[recordId]/page.tsx"
git add COMMIT-T8.bat
echo.

echo Committing...
git commit -m "feat(clinic): T8 - seed Ryu Ju-yeol 342 prescriptions, prioritize in 2nd stage" -m "ETL Ryu Ju-yeol prescription xlsx (4 sheets, 342 rows) into prescriptions table via dump+seed batches. /clinic/[recordId] now shows the constitution's Ryu prescriptions as the MAIN searchable picker (by name or herb), with traditional type-info prescriptions demoted to a collapsible reference. Selected prescription id/name/composition saved to clinicMemo."
echo.

echo Pushing to GitHub (Vercel will auto-redeploy)...
git push origin main
if errorlevel 1 ( echo PUSH FAILED ^& pause ^& exit /b 1 )
echo.

echo ==========================================
echo  Done. Pushed. Vercel will redeploy.
echo ==========================================
echo.
pause

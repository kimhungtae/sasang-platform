@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Commit Phase 3 (2nd-stage + prescription) + push
echo ==========================================
echo.

echo Clearing any stale git locks...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\refs\heads\main.lock" del /f /q ".git\refs\heads\main.lock"
echo.

echo Staging Phase 3 files...
git add CLAUDE.md
git add lib/prescription.ts
git add app/actions/clinic-record.ts
git add components/clinic/SecondStage.tsx
git add components/clinic/RecordView.tsx
git add "app/clinic/[recordId]/page.tsx"
git add VERIFY-PHASE3.bat
git add COMMIT-PHASE3.bat
echo.

echo Committing...
git commit -m "feat(clinic): Phase 3 - 2nd-stage exam + prescription derivation" -m "Add 2nd-stage panel to /clinic/[recordId]: precise inspection / functional exam notes, han-yeol re-confirmation, and prescription candidates derived from type-info rx/rxCold/rxHot. Saves clinicMemo(JSON) and advances stage to reviewed/prescribed. Ryu Ju-yeol 352-Rx DB (T8) to be linked later."
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

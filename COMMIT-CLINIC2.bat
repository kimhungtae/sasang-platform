@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Commit Phase 2 (clinic review) + push
echo ==========================================
echo.

echo Clearing any stale git locks...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"
if exist ".git\refs\heads\main.lock" del /f /q ".git\refs\heads\main.lock"
echo.

echo Staging Phase 2 files...
git add CLAUDE.md
git add app/page.tsx
git add lib/clinic-auth.ts
git add app/actions/clinic.ts
git add app/clinic/page.tsx
git add "app/clinic/[recordId]/page.tsx"
git add components/clinic/ClinicGate.tsx
git add components/clinic/ClinicList.tsx
git add components/clinic/RecordView.tsx
git add VERIFY-CLINIC.bat
git add COMMIT-CLINIC2.bat
echo.

echo Committing...
git commit -m "feat(clinic): Phase 2 - doctor room record lookup with PIN gate" -m "Add /clinic (PIN-gated via CLINIC_PIN cookie), patient record list with search, and /clinic/[recordId] saved-result view. Home gains doctor-room entry."
echo.

echo Pushing to GitHub (Vercel will auto-redeploy)...
git push origin main
if errorlevel 1 ( echo PUSH FAILED & pause & exit /b 1 )
echo.

echo ==========================================
echo  Done. Pushed. Vercel will redeploy.
echo  Remember: add CLINIC_PIN to Vercel env too.
echo ==========================================
echo.
pause

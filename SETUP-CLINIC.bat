@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Clinic feature setup - Phase 1
echo  step1 typecheck   step2 create tables
echo ==========================================
echo.
echo Running... output saved to clinic-setup.log
echo (UV_HANDLE_CLOSING line, if any, is harmless)

echo ===== TYPECHECK ===== > clinic-setup.log
call npx tsc --noEmit >> clinic-setup.log 2>&1
echo. >> clinic-setup.log
echo ===== CREATE CLINIC TABLES ===== >> clinic-setup.log
call npm run create:clinic >> clinic-setup.log 2>&1

echo.
echo Done. Tell Claude it finished - no screenshot needed.
echo.
pause

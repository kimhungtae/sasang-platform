@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Phase 2 typecheck (tsc)
echo ==========================================
echo.
echo Running... output saved to clinic-verify.log

echo ===== TYPECHECK ===== > clinic-verify.log
call npx tsc --noEmit >> clinic-verify.log 2>&1
echo TSC_DONE >> clinic-verify.log

echo.
echo Done. Tell Claude it finished - no screenshot needed.
echo.
pause

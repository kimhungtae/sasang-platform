@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Phase 3 typecheck (tsc)
echo ==========================================
echo.
echo Running... output saved to phase3-verify.log

echo ===== TYPECHECK ===== > phase3-verify.log
call npx tsc --noEmit >> phase3-verify.log 2>&1
echo TSC_DONE >> phase3-verify.log

echo.
echo Done. Tell Claude it finished - it will read phase3-verify.log
echo.
pause

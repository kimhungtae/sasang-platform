@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  Create clinic tables on Turso
echo  (patients, survey_records)
echo ==========================================
echo.
call npm run create:clinic > clinic-tables.log 2>&1
echo Output saved to clinic-tables.log
echo (UV_HANDLE_CLOSING line, if any, is harmless)
echo.
echo Tell Claude it finished - no screenshot needed.
echo.
pause

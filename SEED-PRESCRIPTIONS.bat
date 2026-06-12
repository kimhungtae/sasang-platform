@echo off
chcp 65001 >nul
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  T8 - step 2: seed prescriptions into Turso
echo  (reads data\prescriptions-raw.json)
echo ==========================================
echo.
call npm run seed:prescriptions > seed-prescriptions.log 2>&1
echo Output saved to seed-prescriptions.log
echo (UV_HANDLE_CLOSING line, if any, is harmless)
echo.
echo Done. Tell Claude it finished - it will read the log.
echo.
pause

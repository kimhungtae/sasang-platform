@echo off
chcp 65001 >nul
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo ==========================================
echo  T8 - step 1: dump prescriptions xlsx
echo ==========================================
echo.
echo [1/2] Installing xlsx parser (temporary, --no-save)...
call npm install --no-save xlsx >dump-install.log 2>&1
echo       install log: dump-install.log
echo.
echo [2/2] Parsing xlsx into data\prescriptions-raw.json + xlsx-dump.log ...
call npx tsx scripts/dump-prescriptions.ts >xlsx-dump.log 2>&1
echo.
echo ==========================================
echo  Done. Tell Claude it finished.
echo  (Claude will read xlsx-dump.log and raw.json)
echo ==========================================
echo.
pause

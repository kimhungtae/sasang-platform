@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  T3: Seed Questionnaire to DB
echo ==========================================
echo  Reading: data/questionnaires/adult28.json
echo  Writing to: db/sasang.db
echo ==========================================
echo.

call npm run seed:questionnaire
if errorlevel 1 (
    echo.
    echo ERROR: Seed failed. See message above.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo  SUCCESS! Data seeded.
echo ==========================================
echo  Verify with: npm run db:studio
echo  (opens browser DB UI)
echo.
pause

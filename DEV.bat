@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Starting Sasang Platform Dev Server
echo ==========================================
echo.
echo  After "Ready in xxx ms" message:
echo    Open http://localhost:3000 in browser
echo.
echo  To stop: Press Ctrl+C in this window
echo.
echo  Useful URLs:
echo    http://localhost:3000           (홈)
echo    http://localhost:3000/quiz      (자가진단 시작)
echo    http://localhost:3000/quiz/1    (1번 문항)
echo.
echo ==========================================
echo.

call npm run dev

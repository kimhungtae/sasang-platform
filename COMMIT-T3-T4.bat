@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Commit T3 + T4 and Push to GitHub
echo ==========================================
echo.

echo === Changes ===
git status --short
echo.

echo === Staging ===
git add -A
echo  Staged.
echo.

echo === Commit T3 + T4 ===
git commit -m "feat(quiz): T3+T4 - questionnaire seed and self-assessment UI" -m "T3 (questionnaire ETL):" -m "- Add data/questionnaires/adult28.json (28 questions, 112 choices)" -m "- Add weights config with core questions (1, 2, 5, 9, 28)" -m "- Add seed script (scripts/seed-questionnaire.ts)" -m "" -m "T4 (self-assessment UI):" -m "- Add lib/quiz.ts (server-side data fetching)" -m "- Add /quiz entry page (disclaimer + start)" -m "- Add /quiz/[step] dynamic question route" -m "- Add /result placeholder for T5" -m "- Update home page (sasang-platform landing)" -m "- Components: QuizStep, ProgressBar, Disclaimer"
echo.

echo === Push ===
git push origin main
if errorlevel 1 (
    echo.
    echo ERROR: Push failed.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo  SUCCESS! T3 + T4 pushed.
echo ==========================================
echo  https://github.com/kimhungtae/sasang-platform
echo.
pause

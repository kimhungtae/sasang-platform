@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Commit Today's Work and Push
echo ==========================================
echo.

echo === Changes ===
git status --short
echo.

echo === Staging ===
git add -A
echo  Staged.
echo.

echo === Commit ===
git commit -m "feat(quiz): T3-T4 + v21 clinical questionnaire" -m "Complete self-assessment UI with v21 docx-matched format:" -m "" -m "Database (v24 -> v21 schema):" -m "- Add question types: single-unknown, dual-mark" -m "- Add fields: section, code, tag, effectsJson, confirmConstitution" -m "- 26 questions: 5 body + 3 physio + 8 OX + 4 char + 4 emo + 2 food" -m "" -m "UI components:" -m "- QuizStep: dual-mark (per-option yes/no buttons)" -m "- QuizStep: single-unknown (5th option: 잘 모르겠음)" -m "- QuizStep: ox/killer-ox (yes/no/unknown)" -m "- ProgressBar, Disclaimer components" -m "- Section badges with PART labels and colors" -m "" -m "Data:" -m "- adult-v21.json (26 questions matching clinical docx)" -m "- adult-v24.json (30 questions, kept for reference)" -m "- adult28.json (legacy v23, kept for reference)" -m "" -m "Pages:" -m "- /quiz entry page with full disclaimer" -m "- /quiz/[step] dynamic question route" -m "- /result placeholder for T5" -m "- Updated home page (sasang-platform landing)"
echo.

echo === Push ===
git push origin main
if errorlevel 1 ( echo PUSH FAILED & pause & exit /b 1 )

echo.
echo ==========================================
echo  SUCCESS! Today's work pushed.
echo ==========================================
echo  https://github.com/kimhungtae/sasang-platform
echo.
pause

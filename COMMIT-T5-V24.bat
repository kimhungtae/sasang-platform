@echo off
cd /D "C:\Users\rla1w\Downloads\sasang-platform"
echo.
echo ==========================================
echo  Commit T5 v24-platform and Push
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
git commit -m "feat(quiz): T5 v24-platform - scoring algorithm and result page" -m "Major upgrade aligning with clinical v24 HTML app:" -m "" -m "Data model:" -m "- Add 4 Killer questions (K1-K4) -> 30 questions total" -m "- New schema type: killer-ox (yes/no, no unknown)" -m "- Type renamed: adult-v21 -> adult-v24 (v24-platform version)" -m "" -m "Scoring algorithm (lib/scoring.ts):" -m "- Port v24 calcScores with Stage 1/2/3 separation" -m "- v24 changes: NO penalty -3 -> -1, Laplace smoothing" -m "- Bayesian Prior: ty 0.01 / te 0.45 / sy 0.30 / se 0.24" -m "- Hanyul detection (cold/hot/mixed/neutral)" -m "- Confidence calculation (margin + coverage)" -m "- PART tally for result breakdown" -m "" -m "Type info (data/type-info.ts):" -m "- Full TYPE_INFO for all 4 constitutions" -m "- Traits, physio, foods, diseases, rx (cold/hot variants)" -m "- 6-item saeng (lifestyle guide) per constitution" -m "" -m "Result page (v24 format):" -m "- Hero section with top constitution + organ" -m "- Confidence + Hanyul side-by-side" -m "- Score bars with constitution colors" -m "- Stage progression table (1st -> 2nd -> final)" -m "- PART distribution tally (bipolar +/- support)" -m "- Constitution traits in 6-field grid" -m "- Prescription direction (auto-branched by hanyul)" -m "- 6-item lifestyle guide" -m "- Full disclaimer + actions"
echo.

echo === Push ===
git push origin main
if errorlevel 1 ( echo PUSH FAILED & pause & exit /b 1 )

echo.
echo ==========================================
echo  SUCCESS! T5 v24-platform pushed.
echo ==========================================
echo  https://github.com/kimhungtae/sasang-platform
echo.
pause

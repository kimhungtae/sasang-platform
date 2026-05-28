# sasang-platform setup - PowerShell version
# Runs all git operations + GitHub push

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " sasang-platform Setup (PowerShell)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Move to project folder
Set-Location "C:\Users\rla1w\Downloads\sasang-platform"
Write-Host "Working in: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Step 1: Set git user info
Write-Host "[1/7] Setting git user info..." -ForegroundColor Green
git config --global user.email "epaphrokim@gmail.com"
git config --global user.name "kimhungtae"
git config --global init.defaultBranch main
Write-Host "  Done."
Write-Host ""

# Step 2: Clean up any old .git in home folder
$homeGit = "C:\Users\rla1w\.git"
if (Test-Path $homeGit) {
    Write-Host "[2/7] Removing rogue .git in home folder..." -ForegroundColor Green
    Remove-Item -Recurse -Force $homeGit
    Write-Host "  Removed."
} else {
    Write-Host "[2/7] Home folder is clean." -ForegroundColor Green
}
Write-Host ""

# Step 3: Initialize git repository
Write-Host "[3/7] Initializing git repository..." -ForegroundColor Green
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
}
git init
Write-Host ""

# Step 4: Stage all files
Write-Host "[4/7] Staging all files (this may take a moment)..." -ForegroundColor Green
git add -A
Write-Host "  Done."
Write-Host ""

# Step 5: First commit
Write-Host "[5/7] Creating first commit..." -ForegroundColor Green
git commit -m "chore: bootstrap Next.js 14 + TypeScript + Tailwind"
Write-Host ""

# Step 6: Set main branch and connect to GitHub
Write-Host "[6/7] Connecting to GitHub..." -ForegroundColor Green
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/kimhungtae/sasang-platform.git
git remote -v
Write-Host ""

# Step 7: Push to GitHub
Write-Host "[7/7] Pushing to GitHub..." -ForegroundColor Green
Write-Host "  A browser may open for GitHub login." -ForegroundColor Yellow
Write-Host "  Click 'Authorize' if prompted." -ForegroundColor Yellow
Write-Host ""
git push -u origin main

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " SUCCESS! Setup Complete" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Check: https://github.com/kimhungtae/sasang-platform" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

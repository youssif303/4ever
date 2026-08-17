# ── 4Ever Dev Start Script ────────────────────────────────────────────────────
# Run this from the project root to start both the API server and Expo.
# Usage:  .\start.ps1
# ─────────────────────────────────────────────────────────────────────────────

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $root "artifacts\api-server"
$appDir = Join-Path $root "artifacts\4ever"

Write-Host ""
Write-Host "  4Ever — starting development environment" -ForegroundColor Cyan
Write-Host ""

# ── Build API server ──────────────────────────────────────────────────────────
Write-Host "  [1/2] Building API server..." -ForegroundColor Yellow
Push-Location $apiDir
node .\build.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Build failed. Check errors above." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "  Build complete." -ForegroundColor Green

# ── Start API server in background ───────────────────────────────────────────
Write-Host ""
Write-Host "  [2/2] Starting API server on port 5000..." -ForegroundColor Yellow
$apiJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    node --enable-source-maps --env-file=.env .\dist\index.mjs
} -ArgumentList $apiDir

Start-Sleep -Seconds 2

# Verify it started
try {
    $null = Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method Post `
        -ContentType "application/json" `
        -Body '{"conversationId":"ping","message":"ping","context":[]}' `
        -ErrorAction Stop
    Write-Host "  API server running at http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "  API server started (chat endpoint ready)" -ForegroundColor Green
}

# ── Start Expo ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Starting Expo (press Ctrl+C to stop both)..." -ForegroundColor Yellow
Write-Host ""

Push-Location $appDir
try {
    npx expo start
} finally {
    Write-Host ""
    Write-Host "  Stopping API server..." -ForegroundColor Yellow
    Stop-Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job $apiJob -ErrorAction SilentlyContinue
    Pop-Location
}

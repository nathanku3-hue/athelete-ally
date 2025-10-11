# Check boundaries for new/modified files only
# Uses unified ESLint config for consistency

param(
    [string]$BaseRef = "HEAD~1"
)

Write-Host "🔍 Checking boundaries for new/modified files..." -ForegroundColor Cyan

try {
    # Get list of changed TypeScript/TSX files
    $changedFiles = git diff --name-only --diff-filter=AM "$BaseRef" HEAD | Where-Object { $_ -match '\.(ts|tsx)$' }
    
    if (-not $changedFiles) {
        Write-Host "✅ No TypeScript files changed, skipping boundary check" -ForegroundColor Green
        exit 0
    }
    
    Write-Host "📁 Changed TypeScript files:" -ForegroundColor Yellow
    $changedFiles | ForEach-Object { Write-Host "  $_" }
    
    # Run ESLint with unified config on changed files only
    Write-Host "🚨 Running boundary checks on changed files..." -ForegroundColor Red
    
    $eslintArgs = @(
        "--config", "eslint.config.unified.mjs",
        "--format=compact"
    ) + $changedFiles
    
    & npx eslint @eslintArgs
    
    Write-Host "✅ Boundary checks passed for new/modified files" -ForegroundColor Green
}
catch {
    Write-Host "❌ Boundary checks failed: $_" -ForegroundColor Red
    exit 1
}

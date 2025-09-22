# PowerShell版本的构建产物检查脚本
# 检查构建产物是否被意外提交

Write-Host "🔍 检查是否有构建产物被意外提交..." -ForegroundColor Yellow

# 检查常见的构建产物目录和文件
$BUILD_ARTIFACTS = @(
    "node_modules",
    "dist",
    ".turbo",
    "build",
    ".next",
    "coverage",
    "prisma/generated",
    "generated"
)

$FOUND_ARTIFACTS = @()

foreach ($pattern in $BUILD_ARTIFACTS) {
    $found = Get-ChildItem -Recurse -Directory -Name $pattern -ErrorAction SilentlyContinue
    if ($found) {
        $FOUND_ARTIFACTS += $pattern
    }
}

if ($FOUND_ARTIFACTS.Count -gt 0) {
    Write-Host "❌ 发现以下构建产物被意外提交:" -ForegroundColor Red
    foreach ($artifact in $FOUND_ARTIFACTS) {
        Write-Host "  - $artifact" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "请确保这些目录在.gitignore中，并且从Git历史中移除。" -ForegroundColor Red
    Write-Host "运行以下命令来清理:" -ForegroundColor Red
    Write-Host "  git rm -r --cached <directory>" -ForegroundColor Red
    Write-Host "  git commit -m 'Remove build artifacts'" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ 没有发现构建产物被意外提交" -ForegroundColor Green
}

Write-Host "✅ 构建产物检查通过" -ForegroundColor Green

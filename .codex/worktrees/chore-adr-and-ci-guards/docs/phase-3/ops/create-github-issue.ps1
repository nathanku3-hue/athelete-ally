# create-github-issue.ps1 - Create Phase B deployment tracking issue
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated
#   - Run from repository root: .\docs\phase-3\ops\create-github-issue.ps1
#
# Usage:
#   .\docs\phase-3\ops\create-github-issue.ps1
#

$ErrorActionPreference = "Stop"

$IssueFile = "docs/phase-3/ops/PHASE_B_ISSUE.md"
$Title = "Phase B: Multi-Stream Migration (Staging → Production)"
$Labels = "phase-b,migration,ops,nats,jetstream,staging,production"
$Assignees = "platform-eng,ops-oncall"
$Milestone = "Phase 3 Foundation"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Creating Phase B Deployment Tracking Issue" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Title:     $Title"
Write-Host "Labels:    $Labels"
Write-Host "Assignees: $Assignees"
Write-Host "Milestone: $Milestone"
Write-Host "Issue File: $IssueFile"
Write-Host ""

# Check if gh CLI is installed
try {
    $null = Get-Command gh -ErrorAction Stop
} catch {
    Write-Host "❌ Error: GitHub CLI (gh) is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install GitHub CLI:"
    Write-Host "  - Windows: winget install --id GitHub.cli"
    Write-Host "  - Or download from: https://cli.github.com/"
    Write-Host ""
    exit 1
}

# Check if authenticated
try {
    gh auth status 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
} catch {
    Write-Host "❌ Error: Not authenticated with GitHub CLI" -ForegroundColor Red
    Write-Host ""
    Write-Host "Authenticate with: gh auth login"
    Write-Host ""
    exit 1
}

# Check if issue file exists
if (-not (Test-Path $IssueFile)) {
    Write-Host "❌ Error: Issue file not found: $IssueFile" -ForegroundColor Red
    exit 1
}

Write-Host "Creating issue..." -ForegroundColor Yellow
Write-Host ""

# Create issue
try {
    gh issue create `
      --title $Title `
      --body-file $IssueFile `
      --label $Labels `
      --assignee $Assignees `
      --milestone $Milestone

    # Get issue URL
    $IssueJson = gh issue list --limit 1 --json url | ConvertFrom-Json
    $IssueUrl = $IssueJson[0].url

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "✅ Issue created successfully!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Issue URL: $IssueUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Review issue in GitHub"
    Write-Host "  2. Add to project board: Ops/Migrations lane"
    Write-Host "  3. Link related PRs:"
    Write-Host "     - PR with stream mode fixes (already merged)"
    Write-Host "     - PR with normalize-service metrics (already merged)"
    Write-Host "     - Future staging config PR"
    Write-Host "  4. Schedule staging deployment window"
    Write-Host ""

} catch {
    Write-Host "❌ Error creating issue: $_" -ForegroundColor Red
    exit 1
}

#!/bin/bash
#
# create-github-issue.sh - Create Phase B deployment tracking issue
#
# Prerequisites:
#   - GitHub CLI (gh) installed and authenticated
#   - Run from repository root: bash docs/phase-3/ops/create-github-issue.sh
#
# Usage:
#   bash docs/phase-3/ops/create-github-issue.sh
#

set -e

ISSUE_FILE="docs/phase-3/ops/PHASE_B_ISSUE.md"
TITLE="Phase B: Multi-Stream Migration (Staging → Production)"
LABELS="phase-b,migration,ops,nats,jetstream,staging,production"
ASSIGNEES="platform-eng,ops-oncall"
MILESTONE="Phase 3 Foundation"

echo "============================================================"
echo "Creating Phase B Deployment Tracking Issue"
echo "============================================================"
echo ""
echo "Title:     $TITLE"
echo "Labels:    $LABELS"
echo "Assignees: $ASSIGNEES"
echo "Milestone: $MILESTONE"
echo "Issue File: $ISSUE_FILE"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo ""
    echo "Install GitHub CLI:"
    echo "  - macOS: brew install gh"
    echo "  - Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  - Windows: https://github.com/cli/cli#windows"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo ""
    echo "Authenticate with: gh auth login"
    echo ""
    exit 1
fi

# Check if issue file exists
if [ ! -f "$ISSUE_FILE" ]; then
    echo "❌ Error: Issue file not found: $ISSUE_FILE"
    exit 1
fi

echo "Creating issue..."
echo ""

# Create issue (gh CLI will open in browser for confirmation if needed)
gh issue create \
  --title "$TITLE" \
  --body-file "$ISSUE_FILE" \
  --label "$LABELS" \
  --assignee "$ASSIGNEES" \
  --milestone "$MILESTONE"

ISSUE_URL=$(gh issue list --limit 1 --json url --jq '.[0].url')

echo ""
echo "============================================================"
echo "✅ Issue created successfully!"
echo "============================================================"
echo ""
echo "Issue URL: $ISSUE_URL"
echo ""
echo "Next Steps:"
echo "  1. Review issue in GitHub"
echo "  2. Add to project board: Ops/Migrations lane"
echo "  3. Link related PRs:"
echo "     - PR with stream mode fixes (already merged)"
echo "     - PR with normalize-service metrics (already merged)"
echo "     - Future staging config PR"
echo "  4. Schedule staging deployment window"
echo ""

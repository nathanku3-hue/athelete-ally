# Phase B Issue Creation - Quick Start

This directory contains everything needed to create and track the Phase B multi-stream migration deployment.

---

## Files Overview

| File | Purpose |
|------|---------|
| `PHASE_B_ISSUE.md` | Complete GitHub issue content (copy-paste ready) |
| `create-github-issue.sh` | Bash script to create issue via GitHub CLI (macOS/Linux) |
| `create-github-issue.ps1` | PowerShell script to create issue via GitHub CLI (Windows) |
| `PROJECT_BOARD_UPDATE.md` | Instructions for adding card to project board + checklist items |
| `PHASE_B_RUNBOOK.md` | Complete operations runbook (60+ commands) |
| `monitoring-queries.md` | Grafana dashboards + alert rules |
| `staging.env.example` | Staging environment configuration |
| `create-streams.js` | Idempotent stream creation script |
| `create-consumers.js` | Idempotent consumer creation script |

---

## Quick Start: Create GitHub Issue

### Option 1: Automated (GitHub CLI) - Recommended

**Prerequisites:**
- GitHub CLI installed: https://cli.github.com/
- Authenticated: `gh auth login`

**Linux/macOS:**
```bash
cd /path/to/athlete-ally-original
bash docs/phase-3/ops/create-github-issue.sh
```

**Windows:**
```powershell
cd E:\vibe\athlete-ally-original
.\docs\phase-3\ops\create-github-issue.ps1
```

**Expected Output:**
```
============================================================
Creating Phase B Deployment Tracking Issue
============================================================

Title:     Phase B: Multi-Stream Migration (Staging → Production)
Labels:    phase-b,migration,ops,nats,jetstream,staging,production
Assignees: platform-eng,ops-oncall
Milestone: Phase 3 Foundation

Creating issue...

✅ Issue created successfully!

Issue URL: https://github.com/your-org/athlete-ally/issues/123
```

---

### Option 2: Manual (Web UI)

1. **Navigate to GitHub Issues:**
   ```
   https://github.com/your-org/athlete-ally/issues/new
   ```

2. **Copy issue content:**
   - Open `PHASE_B_ISSUE.md` in your editor
   - Copy entire contents
   - Paste into GitHub issue body

3. **Set metadata:**
   - Title: `Phase B: Multi-Stream Migration (Staging → Production)`
   - Labels: `phase-b`, `migration`, `ops`, `nats`, `jetstream`, `staging`, `production`
   - Assignees: `platform-eng`, `ops-oncall`
   - Milestone: `Phase 3 Foundation`

4. **Click "Submit new issue"**

---

## Add to Project Board

After creating the issue, add it to the project board:

### Option 1: Link Existing Issue

1. Navigate to project board: `https://github.com/your-org/athlete-ally/projects/X`
2. Find "Ops/Migrations" lane
3. Click "Add card"
4. Search for "Phase B: Multi-Stream Migration"
5. Select the issue and add to lane
6. Set status to "In Progress"

### Option 2: Manual Card Creation

See `PROJECT_BOARD_UPDATE.md` for detailed instructions including:
- Complete checklist items (40+ tasks)
- Linked resources (runbook, scripts, monitoring)
- Status update template
- Key metrics to track

---

## Customization

If you need to adjust labels, assignees, or milestone to match your repository:

**Edit the scripts:**

```bash
# create-github-issue.sh (line 13-16)
TITLE="Phase B: Multi-Stream Migration (Staging → Production)"
LABELS="phase-b,migration,ops,nats,jetstream,staging,production"
ASSIGNEES="your-team,your-oncall"  # <-- Change this
MILESTONE="Your Milestone Name"     # <-- Change this
```

```powershell
# create-github-issue.ps1 (line 11-14)
$Title = "Phase B: Multi-Stream Migration (Staging → Production)"
$Labels = "phase-b,migration,ops,nats,jetstream,staging,production"
$Assignees = "your-team,your-oncall"  # <-- Change this
$Milestone = "Your Milestone Name"     # <-- Change this
```

---

## What Happens Next?

After creating the issue and adding to project board:

1. **Review Phase B Runbook** (`PHASE_B_RUNBOOK.md`)
   - Pre-deployment steps (backup, stream creation)
   - Deployment procedure (ConfigMap, rolling restart)
   - Verification steps (logs, metrics, E2E tests)
   - Rollback procedure (< 5 minutes)

2. **Set Up Monitoring** (`monitoring-queries.md`)
   - Create 8 Grafana dashboard panels
   - Configure 5 Prometheus alert rules
   - Test alert delivery (send test alert)

3. **Schedule Staging Deployment**
   - Coordinate with ops team
   - Brief on-call engineer on rollback procedure
   - Set up incident response contacts

4. **Execute Pre-Deployment Steps**
   - Run `create-streams.js` (staging, REPLICAS=1)
   - Run `create-consumers.js` (staging, AA_CORE_HOT)
   - Verify streams and consumers exist

5. **Deploy to Staging**
   - Apply ConfigMap with `EVENT_STREAM_MODE=multi`
   - Rolling restart normalize-service and ingest-service
   - Monitor for 48 hours (daily health checks)

6. **Production Canary**
   - After successful staging soak
   - Canary: 10% → 50% → 100%
   - Extended monitoring (4 hours minimum)

---

## Troubleshooting

### Issue Creation Fails

**Error: "gh: not found" or "command not found"**
```bash
# Install GitHub CLI
# macOS:
brew install gh

# Linux (Debian/Ubuntu):
sudo apt install gh

# Windows:
winget install --id GitHub.cli
```

**Error: "Not authenticated"**
```bash
gh auth login
# Follow the interactive prompts
```

**Error: "Milestone not found"**
- Update milestone name in script to match your repository
- Or remove `--milestone` flag from script

**Error: "Invalid assignees"**
- Ensure assignees are GitHub usernames (not team slugs)
- For teams, use: `--assignee @your-org/team-name`

### Project Board Issues

**Can't find project board**
```bash
# List all projects
gh project list

# Get project details
gh project view <PROJECT_NUMBER>
```

**Manual card addition**
- If automation fails, use the web UI approach
- See `PROJECT_BOARD_UPDATE.md` for complete instructions

---

## Verification Checklist

After issue creation:

- [ ] Issue created with correct title
- [ ] All labels applied (`phase-b`, `migration`, `ops`, `nats`, `jetstream`, `staging`, `production`)
- [ ] Assignees added (`platform-eng`, `ops-oncall`)
- [ ] Milestone set (`Phase 3 Foundation`)
- [ ] Issue added to project board in "Ops/Migrations" lane
- [ ] Status set to "In Progress"
- [ ] Linked resources added (runbook, scripts, monitoring)
- [ ] Team notified in Slack (`#platform-ops`)

---

## Support

**Questions or Issues?**
- Slack: `#platform-ops`
- Email: platform-eng@your-org.com
- On-Call: PagerDuty - Platform Services rotation

**Documentation:**
- Phase B Runbook: `PHASE_B_RUNBOOK.md`
- Monitoring Setup: `monitoring-queries.md`
- Project Board: `PROJECT_BOARD_UPDATE.md`

---

**Last Updated:** 2025-10-02
**Maintained By:** Platform Engineering Team

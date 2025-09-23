# Autonomous Workflow - AUTONOMOUS_TODO.md (Session: Deploy Reliability)

| Priority | Task Description | Status | Verification Steps | Artifacts & Notes |
|:---|:---:|:---:|:---:|:---|
| 1 | **Analyze Failure Logs** | [ ] To Do | Root cause of deploy failure is identified. | Note failing job/step and exact error; map to `deploy.yml` lines. |
| 2 | **Enforce Node 20 & npm ci** | [x] Done | `deploy.yml` uses Node 20 and `npm ci` in all jobs. | Update `actions/setup-node@v4` to 20; replace `npm install` with `npm ci`. |
| 3 | **Guard Snyk Step** | [x] Done | Snyk steps run only when `SNYK_TOKEN` is set. | Add `if: secrets.SNYK_TOKEN != ''` and use `snyk/actions/setup@v4` + CLI with env. |
| 4 | **Verify Docker Login & Envs** | [x] Done | Workflow validates Docker creds and required env before build. | Add `docker/login-action@v3`; add explicit checks for required env variables. |
| 5 | **Add Better Failure Logging** | [ ] To Do | Failure logs include versions and step diagnostics. | Add `set -euxo pipefail`, echo versions, and log summaries in critical steps. |
| 6 | **Local/Test Validation** | [ ] To Do | Dry-run deploy workflow or targeted jobs pass locally (or test env). | Use `act` if available; otherwise static validation and YAML linting. |
| 7 | **Harden Artifact/Build Path** | [ ] To Do | Ensure build outputs exist and are used consistently. | Validate `.next/` artifact presence or adjust Dockerfile for monorepo. |
| 8 | **Add Readiness/Health Checks** | [ ] To Do | Add simple readiness checks where applicable (post-deploy). | Optional placeholders if deploy targets K8s/compose. |
| 9 | **Finalize & Document** | [ ] To Do | Commit, update this plan, and prep bundle/patch artifacts. | Generate `.patch` and `.bundle`; create HANDOFF_REPORT.md. |



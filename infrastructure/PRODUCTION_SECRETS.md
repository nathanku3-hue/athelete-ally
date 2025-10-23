# Production Secrets Configuration

## Required Secrets

### 1. OpenAI API Key
- **Variable:** `OPENAI_API_KEY`
- **Format:** `sk-proj-...`
- **Source:** https://platform.openai.com/api-keys
- **Access:** Engineering Lead only
- **Rotation:** Every 90 days

### 2. JWT Secret
- **Variable:** `JWT_SECRET`
- **Format:** Base64 encoded string (64+ characters)
- **Generation:** `openssl rand -base64 64`
- **Access:** Platform team only
- **Rotation:** Every 180 days

### 3. Database Credentials
- **Variable:** `DATABASE_URL`
- **Format:** `postgresql://user:pass@host:port/dbname`
- **Source:** Managed by Railway (auto-configured)
- **Access:** Platform team only
- **Rotation:** Managed by platform

### 4. LaunchDarkly SDK Key
- **Variable:** `LAUNCHDARKLY_SDK_KEY`
- **Format:** `api-...`
- **Source:** https://app.launchdarkly.com/settings/projects
- **Access:** Engineering Lead, Product Manager
- **Rotation:** Only if compromised

### 5. CORS Origins
- **Variable:** `CORS_ORIGIN`
- **Format:** Comma-separated URLs
- **Value:** `https://app.athlete-ally.com,https://athlete-ally.com`
- **Access:** Engineering team
- **Update:** When adding new frontend domains

## Secret Storage

### Primary: Railway Environment Variables
- Encrypted at rest
- Access logged
- Version controlled (Railway dashboard)

### Backup: 1Password/Vault (Recommended)
- Store backup copies in secure vault
- Share with emergency access only
- Document recovery procedures

## Rotation Schedule

| Secret | Frequency | Owner | Next Rotation |
|--------|-----------|-------|---------------|
| OPENAI_API_KEY | 90 days | Eng Lead | 2025-01-15 |
| JWT_SECRET | 180 days | Platform | 2025-04-15 |
| DATABASE_URL | Managed | Railway | Auto |
| LAUNCHDARKLY_SDK_KEY | As needed | Eng Lead | N/A |

## Emergency Procedures

### If Secret Compromised:
1. **Immediate:** Rotate secret in source system
2. **Update:** Railway environment variable
3. **Deploy:** Restart services
4. **Verify:** Health checks pass
5. **Document:** Incident report

### Secret Rotation Process:
```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -base64 64)

# 2. Update Railway
railway variables set JWT_SECRET=$NEW_SECRET

# 3. Restart service (triggers zero-downtime deployment)
railway restart

# 4. Verify
curl https://planning-engine.up.railway.app/health

# 5. Update backup vault
```

## Access Control

### Who Has Access:
- **Production Secrets:** Engineering Lead, Platform Lead
- **LaunchDarkly:** Engineering Lead, Product Manager
- **Database:** Platform team only
- **Monitoring:** Engineering team

### Access Request Process:
1. Submit request via [access request form]
2. Approval from Engineering Lead
3. Time-limited access (30 days)
4. Access logged and reviewed quarterly

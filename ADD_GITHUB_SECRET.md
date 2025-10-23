# 🔐 Add Railway Token to GitHub Secrets

## Your Railway Token
```
c001b864-733c-4987-ab34-407cab6aee2e
```

## Steps to Add to GitHub

### Method 1: Via GitHub Web UI (Recommended)

1. **Go to repository secrets page:**
   ```
   https://github.com/nathanku3-hue/athelete-ally/settings/secrets/actions
   ```

2. **Click "New repository secret"**

3. **Fill in:**
   - Name: `RAILWAY_TOKEN`
   - Value: `c001b864-733c-4987-ab34-407cab6aee2e`

4. **Click "Add secret"**

5. **Verify:** You should see `RAILWAY_TOKEN` in the list

---

### Method 2: Via GitHub CLI (Alternative)

If you have `gh` CLI installed:

```powershell
gh secret set RAILWAY_TOKEN --body "c001b864-733c-4987-ab34-407cab6aee2e" --repo nathanku3-hue/athelete-ally
```

---

## ✅ Verification

After adding the secret, verify it exists:

1. Go to: https://github.com/nathanku3-hue/athelete-ally/settings/secrets/actions
2. You should see: `RAILWAY_TOKEN` with status "Updated X seconds ago"

---

## ⚠️ Security Note

- ✅ This token is stored securely in GitHub
- ✅ Only visible to GitHub Actions workflows
- ❌ Never commit this token to git
- ❌ Never share in plain text (except in GitHub Secrets)

---

## 🚀 Next Step

Once the secret is added, we can trigger the deployment!

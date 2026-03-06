# GitHub Actions Setup for Azure Static Web Apps

This document explains the GitHub Actions workflows for deploying to Azure Static Web Apps with automatic custom domain configuration.

## 🏗️ Architecture Overview

### Deployment Flow
```
GitHub Push → GitHub Actions → Azure OIDC Auth → Static Web Apps Deploy → DNS Config → Custom Domain
```

### Key Components
- **Azure Static Web Apps**: Hosts the static frontend
- **Azure DNS**: Manages custom domain DNS records
- **GitHub OIDC**: Passwordless authentication to Azure
- **Custom Domains**: Branch-based pattern `{branch}-{repo}.cog.rpotential.dev`

## 📁 Workflows

### 1. `deploy.yml` - Main Deployment Workflow

Triggers on:
- Push to `main`, `develop`, `feature/**`, `release/**`
- Pull requests to `main`, `develop`

**Steps:**
1. Extract branch and repository names
2. Generate custom domain pattern
3. Create build metadata
4. Authenticate to Azure using OIDC
5. Retrieve Static Web App deployment token
6. Deploy to Azure Static Web Apps
7. Create/update DNS CNAME record
8. Configure custom domain
9. Display deployment summary

**Key Features:**
- Branch-based deployments
- Automatic DNS configuration
- Custom domain setup with SSL
- Pull request preview environments
- Automatic cleanup on PR close

### 2. `verify-setup.yml` - Setup Verification Workflow

Manual trigger only (workflow_dispatch)

**Verifications:**
1. ✅ Azure authentication via OIDC
2. ✅ Static Web App access
3. ✅ Deployment token retrieval
4. ✅ DNS zone access
5. ✅ DNS record creation permissions
6. ✅ Custom domain management
7. ✅ GitHub secrets configuration

## 🔐 Required GitHub Secrets

Add these secrets to your GitHub repository:
Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Description |
|-------------|-------------|
| `AZURE_CLIENT_ID` | Service Principal Client ID from org-wide setup |
| `AZURE_TENANT_ID` | Azure AD Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID |

**Note:** These are the same secrets used for backend (AKS) deployments if you have org-wide credentials.

## 🎯 Azure Permissions Required

The service principal needs the following Azure role assignments:

### Static Web App Access
```bash
Role: Website Contributor
Scope: /subscriptions/{subscription}/resourceGroups/rg-rpotential-frontends/providers/Microsoft.Web/staticSites/swa-rpotential-example-frontend
```

### DNS Management
```bash
Role: DNS Zone Contributor
Scope: /subscriptions/{subscription}/resourceGroups/rg-dns-management/providers/Microsoft.Network/dnszones/cog.rpotential.dev
```

These permissions were automatically granted when setting up the workflows.

## 🌐 Custom Domain Pattern

Domains are automatically generated based on branch names:

| Branch | Custom Domain |
|--------|---------------|
| `main` | `main-hello-world-frontend.cog.rpotential.dev` |
| `develop` | `develop-hello-world-frontend.cog.rpotential.dev` |
| `feature/new-ui` | `feature-new-ui-hello-world-frontend.cog.rpotential.dev` |
| `release/v1.0` | `release-v1-0-hello-world-frontend.cog.rpotential.dev` |

**Pattern:**
```
https://{branch-name}-{repository-name}.cog.rpotential.dev
```

Branch names are sanitized:
- `/` → `-`
- `_` → `-`
- Spaces → `-`
- Converted to lowercase

## 🚀 Deployment Process

### Automatic Deployment

1. **Push to a branch:**
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```

2. **GitHub Actions automatically:**
   - Builds and deploys to Azure Static Web Apps
   - Creates DNS CNAME record
   - Configures custom domain
   - Provisions SSL certificate

3. **Access your deployment:**
   - Custom domain: `https://{branch}-{repo}.cog.rpotential.dev`
   - Default Azure domain also works

### Manual Verification

Run the verification workflow to test your setup:

```bash
# Using GitHub CLI
gh workflow run verify-setup.yml --repo {org}/{repo}

# Or via GitHub UI
# Go to Actions → Verify Azure Setup → Run workflow
```

## 🔧 Differences from Azure Pipelines

| Feature | Azure Pipelines | GitHub Actions |
|---------|----------------|----------------|
| **Authentication** | Service Connection | OIDC (passwordless) |
| **Trigger** | azure-pipelines.yml | .github/workflows/deploy.yml |
| **Secrets** | Pipeline Variables | GitHub Secrets |
| **Branch Extraction** | Build.SourceBranchName | github.ref |
| **Deployment Token** | Pipeline Variable | Retrieved via Azure CLI |

## 📊 Monitoring & Debugging

### View Deployment Status

```bash
# List workflow runs
gh run list --repo {org}/{repo}

# View specific run
gh run view {run-id} --repo {org}/{repo}

# View logs
gh run view {run-id} --log --repo {org}/{repo}
```

### Common Issues

#### 1. DNS Not Resolving
**Issue:** Custom domain doesn't work immediately
**Solution:** DNS propagation can take 1-5 minutes. Check:
```bash
nslookup {branch}-{repo}.cog.rpotential.dev
```

#### 2. SSL Certificate Pending
**Issue:** HTTPS shows certificate error
**Solution:** Azure Static Web Apps provisions SSL automatically. Wait 5-10 minutes.

#### 3. Deployment Token Error
**Issue:** "Failed to retrieve deployment token"
**Solution:** Verify service principal has "Website Contributor" role:
```bash
az role assignment list --assignee {CLIENT_ID} --all
```

#### 4. Permission Denied on DNS
**Issue:** "Cannot create DNS record"
**Solution:** Verify "DNS Zone Contributor" role:
```bash
az network dns record-set list --zone-name cog.rpotential.dev --resource-group rg-dns-management
```

## 🔄 Migration from Azure Pipelines

The Azure Pipeline configuration (`azure-pipelines.yml`) is kept for backward compatibility.

**To migrate:**

1. ✅ GitHub Actions workflows created (`.github/workflows/`)
2. ✅ Azure permissions granted
3. ⏳ Add GitHub secrets (see Required GitHub Secrets section)
4. ⏳ Push repository to GitHub (if not already there)
5. ⏳ Run verification workflow
6. ⏳ Test deployment by pushing code

**After successful migration:**
- GitHub Actions will handle all future deployments
- Azure Pipeline can be disabled (but keep the file)
- Same custom domain pattern maintained

## 📚 Azure Resources

### Static Web App
- **Name:** `swa-rpotential-example-frontend`
- **Resource Group:** `rg-rpotential-frontends`
- **Location:** Auto (CDN distributed)
- **SKU:** Free or Standard
- **Default Hostname:** `white-bay-02bd0780f.1.azurestaticapps.net`

### DNS Zone
- **Name:** `cog.rpotential.dev`
- **Resource Group:** `rg-dns-management`
- **Type:** Public DNS Zone
- **Name Servers:** Azure DNS

### Service Principal
- **Name:** `rpo-engg-github-actions` (org-wide)
- **Client ID:** Contact your Azure admin for the organization-wide service principal ID
- **Authentication:** OIDC (Workload Identity Federation)
- **Scope:** All repos in `rpo-engg/*` organization

## 🎨 Customization

### Modify Custom Domain Pattern

Edit `.github/workflows/deploy.yml`:

```yaml
# Change domain pattern
- name: Extract branch name and repository name
  id: extract_info
  run: |
    # Modify this section to change domain pattern
    CUSTOM_DOMAIN="${BRANCH_NAME}-${REPO_NAME}.your-domain.com"
```

### Add Environment-Specific Configuration

```yaml
- name: Deploy to Azure Static Web Apps
  env:
    ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    API_URL: ${{ github.ref == 'refs/heads/main' && 'https://api.prod.com' || 'https://api.dev.com' }}
```

### Custom Build Process

If your frontend requires a build step:

```yaml
- name: Build frontend
  run: |
    npm install
    npm run build

- name: Deploy to Azure Static Web Apps
  with:
    app_location: "dist"  # Change to your build output folder
    skip_app_build: true
```

## 🔍 Verification Checklist

Before your first deployment:

- [ ] GitHub secrets configured (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`)
- [ ] Service principal has "Website Contributor" role on Static Web App
- [ ] Service principal has "DNS Zone Contributor" role on DNS zone
- [ ] Repository pushed to GitHub (under `rpo-engg` or `rpocognitive` org)
- [ ] Verification workflow runs successfully
- [ ] Test deployment to a feature branch

## 📞 Support

**Issues with:**
- **GitHub Actions:** Check workflow logs in Actions tab
- **Azure Authentication:** Run verify-setup workflow
- **DNS Configuration:** Check Azure DNS zone records
- **SSL Certificates:** Wait 5-10 minutes, then check Azure Static Web Apps custom domains

**Useful Commands:**
```bash
# Check Static Web App status
az staticwebapp show --name swa-rpotential-example-frontend --resource-group rg-rpotential-frontends

# List custom domains
az staticwebapp hostname list --name swa-rpotential-example-frontend --resource-group rg-rpotential-frontends

# Check DNS records
az network dns record-set list --zone-name cog.rpotential.dev --resource-group rg-dns-management

# Test deployment
curl -I https://{branch}-{repo}.cog.rpotential.dev
```

---

**Last Updated:** October 2025
**Status:** ✅ Production Ready

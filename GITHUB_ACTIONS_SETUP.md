# GitHub Actions Deployment Setup

## Overview
This project uses GitHub Actions to run tests and checks before deploying to Vercel via a deployment hook.

## Workflow Process

```
Push to main/next → Lint → Type Check → Build → ✅ All Pass → Deploy to Vercel
                      ↓        ↓          ↓
                     Fail?   Fail?     Fail?
                      ↓        ↓          ↓
                    ❌ Stop deployment
```

## Setup Instructions

### 1. Get Vercel Deploy Hook URL

1. Go to your Vercel project dashboard: https://vercel.com
2. Navigate to: **Settings** → **Git** → **Deploy Hooks**
3. Create a new deploy hook:
   - **Name**: `GitHub Actions Deploy`
   - **Git Branch**: `main` (or `next` for your branch)
4. Click **Create Hook**
5. Copy the generated webhook URL (looks like: `https://api.vercel.com/v1/integrations/deploy/...`)

### 2. Add GitHub Secrets

Go to your GitHub repository:
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `VERCEL_DEPLOY_HOOK_URL` | `https://api.vercel.com/v1/integrations/deploy/...` | Your Vercel deploy hook URL |
| `DATABASE_URL` | `postgresql://...` | Your Supabase connection pooling URL |
| `DIRECT_URL` | `postgresql://...` | Your Supabase direct connection URL |
| `NEXTAUTH_SECRET` | `your-secret-here` | Your NextAuth secret (from .env) |
| `NEXTAUTH_URL` | `https://geoattend.vercel.app` | Your production URL with https:// |

### 3. Vercel Environment Variables

Also ensure these are set in **Vercel Dashboard** → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Production, Preview |
| `DIRECT_URL` | `postgresql://...` | Production, Preview |
| `NEXTAUTH_SECRET` | `your-secret-here` | Production, Preview |
| `NEXTAUTH_URL` | `https://geoattend.vercel.app` | Production only |

**Important**: For `NEXTAUTH_URL`, use your actual Vercel domain with `https://` prefix!

### 4. Disable Vercel Git Integration (Optional)

Since we're using the deploy hook, you can:
1. Go to Vercel → **Settings** → **Git**
2. Toggle off **Auto-deploy** (optional)
3. This way, deployment only happens when GitHub Actions succeed

## How It Works

### On Every Commit to `main` or `next`:

1. **Lint Check** - ESLint runs to check code quality
2. **Type Check** - TypeScript validates all types
3. **Build Test** - Full Next.js build is tested
4. **Deploy** - If all pass ✅, webhook triggers Vercel deployment

### If Any Check Fails ❌:

- Deployment is blocked
- You'll see which check failed in GitHub Actions tab
- Fix the issue and push again

## Viewing Status

- **GitHub**: Go to **Actions** tab to see workflow runs
- **Vercel**: Check deployment status in your project dashboard

## Testing the Setup

After adding secrets, push a commit:

```bash
git add .
git commit -m "test: verify GitHub Actions deployment"
git push origin next
```

Then check:
1. GitHub Actions tab - all jobs should pass
2. Vercel dashboard - deployment should trigger after ~30 seconds

## Troubleshooting

### Deployment not triggering?
- Verify `VERCEL_DEPLOY_HOOK_URL` secret is correct
- Check GitHub Actions logs for curl errors

### Build failing on GitHub but works locally?
- Ensure all secrets are added correctly
- Check environment variable values match your local .env

### Vercel deployment failing?
- Check Vercel build logs
- Ensure `NEXTAUTH_URL` has `https://` prefix
- Verify database URLs are correct

## Branches

- **`main`** - Production deployments
- **`next`** - Staging/preview deployments

Each branch can have its own deploy hook for separate environments.

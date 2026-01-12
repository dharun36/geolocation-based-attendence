# GitHub Actions Setup Guide

## 📋 Your Current Workflows

You have **3 workflows**:

### 1. **ci.yml** - Continuous Integration
- Runs lint, type-check, build validation
- Triggers on: Push/PR to `main` or `next`

### 2. **deploy.yml** - Deploy Hook (Simple)
- Runs tests first, then triggers Vercel via webhook
- Triggers on: Push to `main` or `next`

### 3. **vercel-deploy.yml** - Direct Vercel Deploy (Advanced)
- Deploys directly using Vercel CLI
- Triggers on: Push/PR to `main` only

---

## 🎯 Recommended: Use **deploy.yml** (Simplest)

This uses a webhook - easier to set up and maintain.

---

## 📝 Step-by-Step Setup

### Step 1: Get Your Vercel Deploy Hook

1. Go to https://vercel.com
2. Select your project: **geolocation-based-attendence-p5p6**
3. Click **Settings** → **Git**
4. Scroll to **Deploy Hooks** section
5. Click **Create Hook**:
   - Name: `GitHub Actions`
   - Git Branch: `next` (or `main`)
6. Click **Create**
7. **Copy the URL** (looks like: `https://api.vercel.com/v1/integrations/deploy/prj_xxxxx/xxxxxxx`)

---

### Step 2: Add GitHub Secrets

1. Go to your GitHub repo: https://github.com/dharun36/geolocation-based-attendence
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these **ONE BY ONE**:

#### Required Secret #1: VERCEL_DEPLOY_HOOK_URL
- **Name**: `VERCEL_DEPLOY_HOOK_URL`
- **Value**: The URL you copied from Step 1
- Click **Add secret**

#### Required Secret #2: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: (Copy from your `.env` file line 27)
  ```
  postgresql://postgres.jartdwddvrxcefidxruh:dHar'un@007@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- Click **Add secret**

#### Required Secret #3: DIRECT_URL
- **Name**: `DIRECT_URL`
- **Value**: (Copy from your `.env` file line 30)
  ```
  postgresql://postgres.jartdwddvrxcefidxruh:dHar'un@007@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
  ```
- Click **Add secret**

#### Required Secret #4: NEXTAUTH_SECRET
- **Name**: `NEXTAUTH_SECRET`
- **Value**: (Copy from your `.env` file line 6)
  ```
  0usizcCbieTvbji+9jgvUtFZ3LqFjS8eOMdINIJ5McQ=
  ```
- Click **Add secret**

#### Required Secret #5: NEXTAUTH_URL
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://geoattend.vercel.app`
- Click **Add secret**

---

### Step 3: Update Vercel Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables

Update or add these:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXTAUTH_URL` | `https://geoattend.vercel.app` | ✅ Production<br>✅ Preview |
| `NEXTAUTH_SECRET` | (same as in .env) | ✅ Production<br>✅ Preview |
| `DATABASE_URL` | (same as in .env) | ✅ Production<br>✅ Preview |
| `DIRECT_URL` | (same as in .env) | ✅ Production<br>✅ Preview |

**⚠️ IMPORTANT**: Make sure `NEXTAUTH_URL` has `https://` at the beginning!

---

### Step 4: Disable Auto-Deploy on Vercel (Optional)

Since GitHub Actions will trigger deploys:

1. Go to Vercel → **Settings** → **Git**
2. Under **Deploy Configuration**
3. Toggle OFF **Production Branch** auto-deploy (optional)
4. This ensures deployment only happens after tests pass

---

## ✅ Testing Your Setup

Push a commit to test:

```bash
git add .
git commit -m "test: GitHub Actions deployment"
git push origin next
```

Then check:
1. **GitHub Actions tab** - Should show workflow running
2. **Vercel Dashboard** - Deployment should start after tests pass

---

## 🔍 Where to Find Each Value

### From Your Local `.env` File:

Open `D:\Project\geolocation based attendence app\.env`

```env
Line 6  → NEXTAUTH_SECRET
Line 27 → DATABASE_URL  
Line 30 → DIRECT_URL
```

### From Vercel Dashboard:

1. **VERCEL_DEPLOY_HOOK_URL**: Settings → Git → Deploy Hooks
2. **Project settings**: Can copy env vars from Settings → Environment Variables

### From Supabase Dashboard:

If you need to regenerate database URLs:
1. Go to https://supabase.com
2. Select your project: `jartdwddvrxcefidxruh`
3. Settings → Database → Connection string
   - Connection pooling = `DATABASE_URL`
   - Direct connection = `DIRECT_URL`

---

## 📊 Summary Checklist

- [ ] Created Vercel Deploy Hook
- [ ] Added `VERCEL_DEPLOY_HOOK_URL` to GitHub Secrets
- [ ] Added `DATABASE_URL` to GitHub Secrets
- [ ] Added `DIRECT_URL` to GitHub Secrets
- [ ] Added `NEXTAUTH_SECRET` to GitHub Secrets
- [ ] Added `NEXTAUTH_URL` to GitHub Secrets
- [ ] Updated `NEXTAUTH_URL` in Vercel to include `https://`
- [ ] Pushed test commit
- [ ] Verified deployment worked

---

## 🚀 How It Works

```
You push code
    ↓
GitHub Actions runs:
    ├─ Lint ✓
    ├─ Type Check ✓
    └─ Build ✓
         ↓ (all passed)
    Webhook triggers Vercel
         ↓
    Vercel deploys your app
         ↓
    ✅ Live!
```

If any test fails ❌, deployment is blocked automatically.

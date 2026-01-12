# GitHub Actions Workflows

This directory contains CI/CD workflows for the GeoAttend application.

## Workflows

### 1. `ci.yml` - Continuous Integration
Runs on every push and pull request to validate code quality.

**Jobs:**
- **Lint** - Runs ESLint to check code quality
- **Type Check** - Validates TypeScript types
- **Build** - Tests production build
- **Validate Environment** - Checks required environment variables
- **Prisma Validate** - Validates Prisma schema

### 2. `vercel-deploy.yml` - Vercel Deployment
Handles automated deployments to Vercel.

**Jobs:**
- **Deploy Preview** - Deploys preview on pull requests
- **Deploy Production** - Deploys to production on main branch

## Required GitHub Secrets

Add these secrets in: **Repository Settings → Secrets and variables → Actions**

### For CI Workflow:
```
DATABASE_URL          # Your Supabase database pooler URL
DIRECT_URL            # Your Supabase direct connection URL
NEXTAUTH_SECRET       # Your NextAuth secret key
NEXTAUTH_URL          # Your application URL (for CI, can be http://localhost:3000)
```

### For Vercel Deployment Workflow:
```
VERCEL_TOKEN          # Get from: https://vercel.com/account/tokens
VERCEL_ORG_ID         # Found in: .vercel/project.json after first deploy
VERCEL_PROJECT_ID     # Found in: .vercel/project.json after first deploy
```

## Setup Instructions

### 1. Set up GitHub Secrets

Go to your repository on GitHub:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret listed above

### 2. Get Vercel IDs (if using vercel-deploy.yml)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
cd geoattend
vercel link

# This creates .vercel/project.json with your IDs
cat .vercel/project.json
```

Copy the `orgId` and `projectId` from the output and add them as secrets.

### 3. Create Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click **Create Token**
3. Name it: "GitHub Actions"
4. Copy the token
5. Add it as `VERCEL_TOKEN` secret in GitHub

## Usage

### Automatic Triggers

- **On Push to main/develop** - Runs CI checks and deploys to production (main only)
- **On Pull Request** - Runs CI checks and deploys preview

### Manual Trigger

You can manually trigger workflows from:
**Actions** tab → Select workflow → **Run workflow**

## Notifications

All jobs send status updates to Vercel using the `vercel/repository-dispatch` action. This integrates your CI/CD status with Vercel's dashboard.

## Customization

### Change Node.js Version
Edit the `NODE_VERSION` env var in `ci.yml`:
```yaml
env:
  NODE_VERSION: '20.x'  # Change to desired version
```

### Add New Jobs
Follow this template in `ci.yml`:
```yaml
  your-job-name:
    name: Your Job Name
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Your custom step
        run: npm run your-command

      - name: Notify Vercel
        if: always()
        uses: vercel/repository-dispatch/actions/status@v1
        with:
          name: 'Vercel - geolocation-based-attendence-p5p6: your-job-name'
          status: ${{ job.status }}
```

## Troubleshooting

### Workflow fails on first run
- Ensure all required secrets are set
- Check that secret values are correct (no extra quotes or spaces)

### Vercel deployment fails
- Verify `VERCEL_TOKEN` is valid
- Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
- Ensure project is linked to Vercel

### Environment validation fails
- Make sure all environment secrets are added
- Verify DATABASE_URL uses the pooler (port 6543)
- Check NEXTAUTH_SECRET is set

## Status Badges

Add these badges to your README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
![Vercel](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Vercel%20Deployment/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

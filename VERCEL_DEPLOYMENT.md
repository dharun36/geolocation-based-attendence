# Vercel Deployment Guide

## Prerequisites
- Supabase PostgreSQL database already set up
- Vercel account

## Step-by-Step Deployment

### 1. Prepare Your Repository
Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Select the `geoattend` folder as the root directory

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
DATABASE_URL=postgresql://postgres.jartdwddvrxcefidxruh:dHar%27un%40007@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.jartdwddvrxcefidxruh:dHar%27un%40007@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

NEXTAUTH_SECRET=0usizcCbieTvbji+9jgvUtFZ3LqFjS8eOMdINIJ5McQ=

NEXTAUTH_URL=https://your-app-name.vercel.app

NODE_ENV=production
```

**Important Notes:**
- ✅ Use the **pooler URL (port 6543)** for `DATABASE_URL` - essential for serverless
- ✅ Use the **direct URL (port 5432)** for `DIRECT_URL` - used for migrations
- ✅ Password special characters must be URL-encoded (`'` → `%27`, `@` → `%40`)
- ✅ Replace `your-app-name.vercel.app` with your actual Vercel URL after first deployment
- ✅ Set all variables for "Production", "Preview", and "Development" environments

### 4. Build Settings (Auto-detected)
Vercel should auto-detect these settings, but verify:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 5. Deploy
Click "Deploy" button. Vercel will:
1. Install dependencies
2. Run `prisma generate` (via postinstall script)
3. Build your Next.js app
4. Deploy to production

### 6. Update NEXTAUTH_URL
After first deployment:
1. Copy your Vercel URL (e.g., `https://your-app-name.vercel.app`)
2. Update the `NEXTAUTH_URL` environment variable in Vercel Settings
3. Redeploy (optional: Vercel → Deployments → ... → Redeploy)

### 7. Run Migrations (if needed)
If you need to run database migrations on production:

```bash
# Install Vercel CLI locally
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

## Troubleshooting

### "Internal Server Error" after deployment
- Check Vercel logs: Dashboard → Deployments → Click deployment → Runtime Logs
- Verify all environment variables are set correctly
- Ensure password is URL-encoded in connection strings

### Database connection issues
- Verify you're using the **pooler URL (port 6543)** for DATABASE_URL
- Check Supabase database is accessible and active
- Verify connection string encoding

### Build failures
- Check build logs in Vercel dashboard
- Ensure `package.json` scripts are correct
- Verify Prisma schema is valid: `npx prisma validate`

### Authentication errors
- Verify `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your deployed URL
- Check for JWT errors in runtime logs

## Production Checklist
- ✅ All environment variables set in Vercel
- ✅ DATABASE_URL uses pooler (port 6543)
- ✅ NEXTAUTH_URL matches deployment URL
- ✅ Database migrations applied
- ✅ Test login functionality
- ✅ Test attendance check-in/out
- ✅ Verify admin dashboard access

## Continuous Deployment
After initial setup, every push to your main branch will automatically:
1. Trigger a new build
2. Run tests (if configured)
3. Deploy if build succeeds

## Custom Domain (Optional)
1. Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` to your custom domain
4. Configure DNS as instructed by Vercel

# 🚀 Vercel Deployment Checklist

## Before Deploying

- [ ] Code is committed to Git repository (GitHub, GitLab, or Bitbucket)
- [ ] Database is set up on Supabase
- [ ] All required environment variables are ready
- [ ] Local build succeeds: `npm run build`
- [ ] Environment check passes: `npm run check-env`

## Deployment Steps

### 1. Connect to Vercel
- [ ] Login to [Vercel](https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import your Git repository
- [ ] Select `geoattend` as root directory (if in a monorepo)

### 2. Environment Variables

Add these in Vercel → Settings → Environment Variables:

```bash
DATABASE_URL=postgresql://postgres.jartdwddvrxcefidxruh:dHar%27un%40007@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.jartdwddvrxcefidxruh:dHar%27un%40007@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

NEXTAUTH_SECRET=0usizcCbieTvbji+9jgvUtFZ3LqFjS8eOMdINIJ5McQ=

NEXTAUTH_URL=https://your-app-name.vercel.app

NODE_ENV=production
```

**Important:**
- [ ] Use pooler URL (port 6543) for DATABASE_URL
- [ ] URL-encode special characters in password
- [ ] Apply to Production, Preview, and Development

### 3. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors

### 4. Post-Deployment
- [ ] Copy your Vercel URL
- [ ] Update `NEXTAUTH_URL` with your actual Vercel URL
- [ ] Redeploy to apply the change
- [ ] Test the live application
  - [ ] Login works
  - [ ] Dashboard loads
  - [ ] Attendance check-in/out works
  - [ ] Location features work

## Verification

- [ ] No errors in Vercel runtime logs
- [ ] Database connection working
- [ ] Authentication working
- [ ] All pages load correctly
- [ ] API routes responding

## Troubleshooting

If you encounter errors:

1. **Check Runtime Logs**
   - Vercel Dashboard → Deployments → Click deployment → Runtime Logs

2. **Verify Environment Variables**
   - Settings → Environment Variables
   - Ensure all 5 variables are set correctly

3. **Database Connection**
   - Use pooler URL (port 6543) for DATABASE_URL
   - Verify password is URL-encoded
   - Test connection from Supabase dashboard

4. **Build Errors**
   - Check build logs
   - Run `npm run build` locally
   - Ensure Prisma schema is valid

## Resources

- 📖 [Full Deployment Guide](./VERCEL_DEPLOYMENT.md)
- 🔧 [Vercel Documentation](https://vercel.com/docs)
- 🗄️ [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- 🔐 [NextAuth Deployment](https://next-auth.js.org/deployment)

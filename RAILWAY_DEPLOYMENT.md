# Railway Deployment Guide

This guide will help you deploy your Team Task Management application on Railway.

## Prerequisites

- A [Railway account](https://railway.app) (sign up for free)
- Git installed and your project pushed to GitHub
- Your GitHub account connected to Railway

## Step 1: Prepare Your Project

Your project is already configured for Railway! We've set up:
- ✅ `railway.toml` - Railway configuration file
- ✅ `.env.example` - Environment variables template
- ✅ `package.json` - Build and start scripts configured
- ✅ `backend/prisma/schema.prisma` - Updated to use PostgreSQL

## Step 2: Connect to Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Authorize Railway to access your GitHub account
5. Select your `team-task-management` repository

## Step 3: Configure Services

Railway will auto-detect this as a monorepo. You need to create:

### Service 1: PostgreSQL Database
1. In your Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Railway will automatically set the `DATABASE_URL` variable

### Service 2: Node.js Backend
1. Click **+ New** → **GitHub Repo**
2. Deploy your repository
3. Configure environment variables (see Step 4)
4. Set the start command to: `cd backend && npx prisma migrate deploy && node index.js`

## Step 4: Set Environment Variables

In your Railway project settings, add these variables:

```
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_here_change_this
PORT=3000
CORS_ORIGIN=https://your-railway-domain.up.railway.app
```

The `DATABASE_URL` will be automatically set by the PostgreSQL service.

## Step 5: Configure Build Settings

In the deployment settings for your service:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
cd backend && npx prisma migrate deploy && node index.js
```

**Nixpacks:** Leave as default (auto-detected)

## Step 6: Deploy

1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Configure for Railway deployment"
   git push origin main
   ```

2. Railway will automatically detect changes and redeploy

3. Monitor the deployment in the Railway dashboard

## Step 7: Initialize Database

After deployment:

1. Go to your Railway project
2. Open the Node.js service logs
3. Watch for the Prisma migration to complete
4. Your database schema will be automatically applied

## Accessing Your App

Once deployed, your app will be available at:
- **Backend API**: `https://your-service-name.up.railway.app/api`
- **Frontend**: Served from the same domain

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Set automatically by Railway |
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | Create a secure random string |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-domain.up.railway.app` |

## Troubleshooting

### Build Fails
- Check that `npm run build` works locally
- Ensure all dependencies are in `package.json`
- Review build logs in Railway dashboard

### Database Connection Error
- Verify `DATABASE_URL` is set in Railway
- Check PostgreSQL service is running
- Run `npx prisma migrate deploy` in Railway shell

### Frontend Not Loading
- Ensure frontend build folder exists at `frontend/dist`
- Check `backend/index.js` serves static files correctly
- Verify `NODE_ENV=production` is set

### CORS Issues
- Update `CORS_ORIGIN` variable to your Railway domain
- Ensure backend CORS is configured correctly

## Local Testing

Before deploying, test locally with PostgreSQL:

```bash
# Create .env in backend/
DATABASE_URL="postgresql://user:password@localhost:5432/task_management"
NODE_ENV="development"
PORT=5000
JWT_SECRET="test_secret"

# Install dependencies
npm run install-all

# Run migrations
cd backend
npx prisma migrate deploy

# Start development
npm run dev
```

## Useful Links

- [Railway Docs](https://docs.railway.app)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Railway CLI Documentation](https://docs.railway.app/reference/cli-api)

## Support

For issues, check:
1. Railway deployment logs
2. Railway service status
3. [Railway Discord Community](https://discord.gg/railway)

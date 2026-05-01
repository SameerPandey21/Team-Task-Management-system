# Team Task Management Deployment Setup

Your application is now configured for Railway deployment! Here's what was set up:

## Files Created/Modified:

✅ **railway.toml** - Railway platform configuration
✅ **Procfile** - Alternative deployment configuration  
✅ **backend/.env.example** - Environment variables template
✅ **.gitignore** - Git ignore rules
✅ **backend/prisma/schema.prisma** - Updated to use PostgreSQL
✅ **RAILWAY_DEPLOYMENT.md** - Complete deployment guide

## Quick Start Checklist:

1. **Update backend/.env** with your JWT secret and other variables
2. **Push to GitHub**: Commit all changes and push to your repository
3. **Create Railway account** at https://railway.app
4. **Connect GitHub** to Railway
5. **Add PostgreSQL service** in Railway dashboard
6. **Set environment variables** in Railway (see RAILWAY_DEPLOYMENT.md for details)
7. **Deploy** - Railway will auto-detect and deploy

## Key Changes Made:

### 1. Database Configuration
- Changed from SQLite to PostgreSQL
- Prisma now reads `DATABASE_URL` from environment variables
- Ready for Railway's managed PostgreSQL

### 2. Server Configuration
- Updated to listen on `0.0.0.0` (Railway compatible)
- Properly handles `PORT` environment variable
- Frontend built files are served in production mode

### 3. Build Process
- `npm run build` creates optimized frontend and backend
- Prisma migrations run on deploy
- Automatic database schema initialization

## Next Steps:

1. Read **RAILWAY_DEPLOYMENT.md** for detailed instructions
2. Copy `backend/.env.example` to `backend/.env` and update values:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Test locally with PostgreSQL before deploying
4. Push to GitHub and deploy via Railway

## Environment Variables You Need to Set:

- `DATABASE_URL` - Set automatically by Railway PostgreSQL service
- `JWT_SECRET` - Create a strong random string
- `CORS_ORIGIN` - Your Railway domain (e.g., your-app.up.railway.app)
- `NODE_ENV` - Set to "production"

For detailed step-by-step instructions, see **RAILWAY_DEPLOYMENT.md**

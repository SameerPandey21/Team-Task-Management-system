# Team Task Management Deployment Setup

Your application is now configured for Railway deployment! Here's what was set up:

## Files Created/Modified:

✅ **railway.toml** - Railway platform configuration
✅ **Procfile** - Alternative deployment configuration  
✅ **backend/.env.example** - Environment variables template
✅ **.gitignore** - Git ignore rules
✅ **backend/prisma/schema.prisma** - Updated to use PostgreSQL
✅ **RAILWAY_DEPLOYMENT.md** - Complete deployment guide
✅ **Dockerfile** - Container build definition
✅ **docker-compose.yml** - Local Docker deployment setup
✅ **.dockerignore** - Docker ignore rules
✅ **render.yaml** - Render backend and database configuration

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

## Docker Deployment

You can deploy this app anywhere Docker is supported.

### Local Docker Run

```bash
docker compose up --build
```

### Docker Environment Notes

- App listens on port `5000` inside the container
- Local mapped port is `3000`
- `DATABASE_URL` points to the `db` service
- Replace `JWT_SECRET` in `docker-compose.yml` before production use

## Frontend Deployment on Vercel or Netlify

This project is a full-stack app. Use Vercel or Netlify for the frontend only, and host the backend separately.

### Vercel Setup

1. Create a new Vercel project and connect your GitHub repo.
2. Use the root `vercel.json` configuration.
3. Set the project root to the repository root.
4. Configure environment variables:
   - `VITE_API_URL=https://your-backend-url/api`
5. Vercel build command will use `frontend/package.json` and deploy `frontend/dist`.

### Netlify Setup

1. Create a new Netlify site and connect your GitHub repo.
2. Use `netlify.toml` from the repository root.
3. Set build command to:
   ```bash
   cd frontend && npm install && npm run build
   ```
4. Set publish directory to:
   ```text
   frontend/dist
   ```
5. Configure environment variables:
   - `VITE_API_URL=https://your-backend-url/api`

### Backend Hosting

Deploy the backend on a separate host such as Railway, Render, Fly.io, or any Docker-capable provider.

- Start command:
  ```bash
  cd backend && npx prisma migrate deploy && node index.js
  ```
- Environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NODE_ENV=production`
  - `PORT=5000`
  - `CORS_ORIGIN=https://your-frontend-domain`

### Render Backend Setup

1. Create a Render account at https://render.com.
2. Connect your GitHub repository.
3. Create a new Web Service.
4. Set the root directory to `backend`.
5. Use this build command:
   ```bash
   npm install
   ```
6. Use this start command:
   ```bash
   npx prisma migrate deploy && node index.js
   ```
7. Add these environment variables in Render:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT=5000`
   - `CORS_ORIGIN=https://your-netlify-domain.netlify.app`

### Render PostgreSQL Database

1. In Render, create a new PostgreSQL database.
2. Copy the generated `DATABASE_URL` into your backend service env vars.
3. Use the same database URL value for the backend service.

## Environment Variables You Need to Set:

- `DATABASE_URL` - Set automatically by Railway PostgreSQL service
- `JWT_SECRET` - Create a strong random string
- `CORS_ORIGIN` - Your Railway domain (e.g., your-app.up.railway.app)
- `NODE_ENV` - Set to "production"

For detailed step-by-step instructions, see **RAILWAY_DEPLOYMENT.md**

# Deployment Guide

This guide covers deploying the CBS Digital Screen Generator to production using Railway.

## Prerequisites

- GitHub account with the repository
- Railway account (sign up at [railway.app](https://railway.app))
- OpenAI API key
- Hive API credentials (for MarComms integration)

## Architecture Overview

The application consists of two services:
- **Frontend**: React/Vite static site with modular component architecture (screens, components, layouts)
- **Backend**: FastAPI Python server with export services and OpenAI integration

Both services are deployed separately on Railway and communicate via REST API.

## Deployment Steps

### 1. Prepare Your Repository

Ensure all deployment files are committed:
```
backend/
├── Procfile              # Uvicorn start command
├── railway.toml          # Railway configuration
├── requirements.txt      # Python dependencies
└── .env.example          # Environment template

frontend/
├── railway.toml          # Railway configuration
├── package.json          # Node dependencies
└── .env.example          # Environment template
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `Digital-Screen-Template-Generator` repository
4. Railway will detect the monorepo structure

### 3. Deploy Backend Service

1. In your Railway project, click **"New Service"** → **"GitHub Repo"**
2. Select the same repository
3. Configure the service:
   - **Root Directory**: `backend`
   - **Start Command**: (auto-detected from Procfile)

4. Add environment variables in the **Variables** tab:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key
   HIVE_API_KEY=your-hive-api-key
   HIVE_USER_ID=your-hive-user-id
   HIVE_WORKSPACE_ID=your-hive-workspace-id
   HIVE_DEFAULT_PROJECT_ID=your-hive-project-id
   FRONTEND_URL=https://your-frontend.up.railway.app  (set after frontend deploys)
   ```

5. Deploy and note the generated URL (e.g., `https://backend-production-xxxx.up.railway.app`)

### 4. Deploy Frontend Service

1. Click **"New Service"** → **"GitHub Repo"** again
2. Select the same repository
3. Configure the service:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve dist -s -l $PORT`

4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-url.up.railway.app
   ```
   (Use the backend URL from step 3)

5. Deploy and note the generated URL

### 5. Link Services (CORS)

After both services are deployed:

1. Go back to the **Backend** service
2. Add/update the `FRONTEND_URL` variable with your frontend's Railway URL
3. Redeploy the backend for CORS to take effect

### 6. Verify Deployment

1. Visit your frontend URL
2. Test the full workflow:
   - Submit slide metadata
   - Generate a slide
   - Download in different formats
   - Submit to Hive (if configured)

## Environment Variables Reference

### Backend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o Vision |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: localhost) |
| `FRONTEND_URL` | Yes* | Production frontend URL for CORS |
| `HIVE_API_KEY` | No | Hive API key for MarComms integration |
| `HIVE_USER_ID` | No | Hive user ID |
| `HIVE_WORKSPACE_ID` | No | Hive workspace ID |
| `HIVE_DEFAULT_PROJECT_ID` | No | Default Hive project for submissions |

*Required for production deployment

### Frontend Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL |

## Custom Domain (Optional)

Railway supports custom domains:

1. Go to your service's **Settings** tab
2. Click **"Custom Domain"**
3. Add your domain (e.g., `doug.business.columbia.edu`)
4. Configure DNS records as instructed
5. Update CORS settings if needed

## Monitoring & Logs

- View real-time logs in Railway dashboard
- Backend health check: `GET /health`
- Monitor deployment status in the **Deployments** tab

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend
- Check that the URL includes `https://` and no trailing slash

### Build Failures
- Check Railway build logs for dependency issues
- Ensure `requirements.txt` and `package.json` are up to date

### API Connection Issues
- Verify `VITE_API_BASE_URL` points to the correct backend URL
- Check backend logs for errors

### Hive Integration Not Working
- Verify all Hive environment variables are set
- Check Hive API credentials are valid
- Review backend logs for Hive API errors

## Cost Estimation

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month credit (sufficient for low traffic)
- **Pro Plan**: $20/month + usage-based pricing

Typical monthly cost for this app: **$5-15/month** depending on usage.

## Security Notes

- Never commit `.env` files to the repository
- Use Railway's environment variables for all secrets
- Keep API keys rotated regularly
- The `.gitignore` already excludes sensitive files

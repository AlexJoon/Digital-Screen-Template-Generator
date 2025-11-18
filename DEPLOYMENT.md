# Deployment Guide

Production deployment guide for the SlideSpeak Ingestion Tool.

## Architecture Overview

```
┌─────────────────┐
│  Parent Website │
│   (Your Site)   │
└────────┬────────┘
         │ iframe embed
         ▼
┌─────────────────┐      ┌──────────────┐
│  Frontend (UI)  │─────▶│ Backend API  │
│   React/Vite    │      │   FastAPI    │
└─────────────────┘      └──────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
              ┌──────────┐          ┌────────────┐
              │ OpenAI   │          │ SlideSpeak │
              │   API    │          │    API     │
              └──────────┘          └────────────┘
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Best for:** Quick deployment with minimal configuration

#### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`
4. Add environment variable:
   - `VITE_API_BASE_URL`: Your backend URL
5. Deploy

#### Backend (Railway)

1. Push code to GitHub
2. Create new project in Railway
3. Configure:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `SLIDESPEAK_API_KEY`: Your SlideSpeak API key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CORS_ORIGINS`: Your frontend URL(s)
5. Deploy

### Option 2: Docker Deployment

**Best for:** Self-hosted or cloud VM deployment

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SLIDESPEAK_API_KEY=${SLIDESPEAK_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
    depends_on:
      - backend
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

### Option 3: AWS Deployment

**Best for:** Enterprise-scale deployment

#### Backend (AWS Elastic Beanstalk or ECS)

1. Create application in Elastic Beanstalk
2. Choose Python platform
3. Upload zipped backend code
4. Configure environment variables
5. Set instance type based on expected load

#### Frontend (S3 + CloudFront)

1. Build frontend: `npm run build`
2. Create S3 bucket
3. Enable static website hosting
4. Upload `dist` contents to S3
5. Create CloudFront distribution
6. Configure custom domain (optional)

## Environment Configuration

### Production Environment Variables

**Backend** (`backend/.env`):
```bash
SLIDESPEAK_API_KEY=d918b19f-f2d8-4c9e-a2e4-f66ab3bd3557
OPENAI_API_KEY=sk-your-real-openai-key
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Frontend** (`frontend/.env.production`):
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Security Considerations

### 1. CORS Configuration

Only allow trusted domains:
```python
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### 2. API Rate Limiting

Add rate limiting to prevent abuse:

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/upload-and-generate")
@limiter.limit("10/minute")
async def upload_and_generate(...):
    ...
```

Install: `pip install slowapi`

### 3. File Upload Security

Already implemented:
- File type validation
- Size limits (configured in web server)

Consider adding:
- Virus scanning for uploaded files
- File size limits in code
- Temporary file cleanup

### 4. API Key Protection

- Never expose API keys in frontend code
- Use environment variables
- Rotate keys periodically
- Monitor API usage

### 5. HTTPS/SSL

Always use HTTPS in production:
- Use Let's Encrypt for free SSL
- Configure in nginx/CloudFront
- Redirect HTTP to HTTPS

## Performance Optimization

### 1. Caching

**Frontend:**
- Enable browser caching for static assets
- Use CDN (CloudFront, Cloudflare)

**Backend:**
- Cache SlideSpeak responses if applicable
- Use Redis for session management

### 2. Compression

Enable gzip compression:
- In nginx (shown in nginx.conf above)
- Or in FastAPI middleware

### 3. Async Processing

For large files, consider:
- Background job processing (Celery)
- Webhook notifications when complete
- WebSocket for real-time updates

### 4. Load Balancing

For high traffic:
- Multiple backend instances
- Load balancer (AWS ALB, nginx)
- Auto-scaling based on CPU/memory

## Monitoring

### 1. Application Monitoring

**Backend:**
```python
# Add logging
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/upload-and-generate")
async def upload_and_generate(...):
    logger.info(f"Processing file: {file.filename}")
    ...
```

**Recommended Tools:**
- Sentry for error tracking
- DataDog for APM
- CloudWatch (AWS)

### 2. Health Checks

Already implemented at `/health`:
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

Configure monitoring to check this endpoint.

### 3. API Usage Tracking

Monitor:
- Number of presentations generated
- API costs (OpenAI, SlideSpeak)
- Error rates
- Response times

## Scaling Considerations

### Vertical Scaling
- Increase server CPU/RAM
- Good for moderate traffic

### Horizontal Scaling
- Multiple backend instances
- Load balancer
- Shared session storage
- Good for high traffic

### Database (Optional)
If you need to track users/history:
- PostgreSQL for relational data
- Redis for caching
- S3 for file storage

## Backup and Recovery

### 1. Configuration Backup
- Store environment variables securely
- Version control all code
- Document API keys location

### 2. Logs
- Centralize logs (CloudWatch, Loggly)
- Retain for 30+ days
- Monitor for errors

### 3. Disaster Recovery
- Regular backups of configuration
- Multi-region deployment (optional)
- Documented recovery procedures

## iframe Embedding Best Practices

### 1. Content Security Policy

On parent site:
```html
<meta http-equiv="Content-Security-Policy"
      content="frame-src https://slidespeak-tool.yourdomain.com">
```

### 2. iframe Security

```html
<iframe
  src="https://slidespeak-tool.yourdomain.com"
  sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
  width="100%"
  height="700px"
></iframe>
```

### 3. Communication

If parent needs to interact with iframe:

**Parent site:**
```javascript
iframe.contentWindow.postMessage({type: 'config', theme: 'dark'}, '*');
```

**App (frontend/src/App.jsx):**
```javascript
useEffect(() => {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'config') {
      // Handle config
    }
  });
}, []);
```

## Cost Estimation

### API Costs (Monthly)
- **SlideSpeak**: Pay per presentation generated
- **OpenAI**: ~$0.002-0.02 per request (GPT-4)
- **Hosting**: $5-50 depending on platform

### Scaling Costs
- **Low traffic** (< 100 presentations/day): ~$20/month
- **Medium traffic** (100-1000/day): ~$100-300/month
- **High traffic** (> 1000/day): Custom pricing

## Deployment Checklist

- [ ] Update API keys in production environment
- [ ] Configure CORS for production domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable compression and caching
- [ ] Configure rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging
- [ ] Set up health check monitoring
- [ ] Test iframe embedding on production site
- [ ] Document deployment process
- [ ] Set up automated backups
- [ ] Create rollback plan
- [ ] Load test application
- [ ] Security audit

## Support

For deployment issues:
- Check application logs
- Review API documentation
- Contact platform support (Vercel, Railway, etc.)

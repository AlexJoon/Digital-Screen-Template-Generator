# Troubleshooting Guide

Common issues and solutions for the SlideSpeak Ingestion Tool.

## Quick Diagnostics

Run these checks first:

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check if frontend is running
curl http://localhost:5173

# Check Python version
python3 --version  # Should be 3.9+

# Check Node version
node --version     # Should be 18+
```

---

## Backend Issues

### Issue: Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
source venv/bin/activate  # Make sure venv is activated
pip install -r requirements.txt
```

---

**Error:** `pydantic_core._pydantic_core.ValidationError`

**Solution:** Missing environment variables
```bash
cd backend
cp .env.example .env
# Edit .env and add required API keys
```

---

**Error:** `Address already in use`

**Solution:** Port 8000 is taken
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in main.py
uvicorn.run(app, host="0.0.0.0", port=8001)
```

---

### Issue: SlideSpeak API errors

**Error:** `401 Unauthorized`

**Solution:** Invalid API key
```bash
# Check your API key in backend/.env
SLIDESPEAK_API_KEY=d918b19f-f2d8-4c9e-a2e4-f66ab3bd3557
```

---

**Error:** `429 Too Many Requests`

**Solution:** Rate limit exceeded
- Wait a few minutes before retrying
- Check your SlideSpeak account for rate limits
- Implement rate limiting in your app

---

**Error:** `500 Internal Server Error` from SlideSpeak

**Solution:**
- Check SlideSpeak status page
- Verify your API key is active
- Try with a smaller file
- Check SlideSpeak logs in your dashboard

---

### Issue: OpenAI API errors

**Error:** `Invalid API key`

**Solution:**
```bash
# Update backend/.env with real OpenAI key
OPENAI_API_KEY=sk-your-real-key-here
```

**Note:** App works without OpenAI (falls back to original text)

---

**Error:** `Rate limit reached`

**Solution:**
- Check OpenAI usage dashboard
- Upgrade OpenAI plan
- Implement caching to reduce calls

---

### Issue: CORS errors

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
```bash
# Add frontend URL to backend/.env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Restart backend
python main.py
```

For production:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

### Issue: Timeout errors

**Error:** `Request timeout`

**Solution:** Increase timeouts

In `backend/services/slidespeak_service.py`:
```python
async with httpx.AsyncClient(timeout=300.0) as client:  # 5 minutes
```

In `backend/main.py`:
```python
@app.post("/upload-and-generate")
async def upload_and_generate(...):
    # Add longer processing time
```

---

## Frontend Issues

### Issue: Frontend won't start

**Error:** `Cannot find module`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or change port in vite.config.js
server: { port: 5174 }
```

---

### Issue: Cannot connect to backend

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution:**

1. Check backend is running:
```bash
curl http://localhost:8000/health
```

2. Check frontend .env:
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

3. Restart both servers

---

### Issue: File upload fails

**Error:** `File type not supported`

**Solution:**
- Only these types are supported:
  - PDF (.pdf)
  - Word (.doc, .docx)
  - PowerPoint (.ppt, .pptx)
  - Text (.txt)

Check file extension and MIME type.

---

**Error:** `Request Entity Too Large`

**Solution:** File too large

In nginx (if using):
```nginx
client_max_body_size 50M;
```

In FastAPI (add to main.py):
```python
app.add_middleware(
    ...
    max_upload_size=50_000_000  # 50MB
)
```

---

### Issue: Progress bar stuck

**Symptoms:** Progress bar stops at certain percentage

**Solution:**

1. Check browser console for errors
2. Check backend logs
3. Verify network connection
4. Increase timeout in frontend:

In `frontend/src/App.jsx`:
```javascript
const response = await axios.post(
  ...
  { timeout: 180000 }  // 3 minutes
)
```

---

### Issue: Download button doesn't work

**Error:** Nothing happens when clicking download

**Solution:**

1. Check download URL is valid:
```javascript
console.log('Download URL:', downloadUrl)
```

2. Try opening URL directly:
```javascript
window.location.href = downloadUrl  // Instead of window.open
```

3. Check for popup blockers

---

## iframe Embedding Issues

### Issue: iframe not displaying

**Solution:**

1. Check X-Frame-Options header:
```python
# In backend, remove or modify:
# Don't set X-Frame-Options: DENY
```

2. Check parent site CSP:
```html
<meta http-equiv="Content-Security-Policy"
      content="frame-src https://your-app-url.com">
```

3. Verify CORS settings

---

### Issue: iframe height issues

**Solution:**

Set explicit height:
```html
<iframe
  src="..."
  width="100%"
  height="700px"
  style="min-height: 600px;"
></iframe>
```

Or use JavaScript:
```javascript
const iframe = document.querySelector('iframe');
iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
```

---

### Issue: File uploads don't work in iframe

**Solution:**

1. Check iframe sandbox attribute:
```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
  ...
></iframe>
```

2. Ensure CORS is configured for parent domain

---

## Presentation Generation Issues

### Issue: No slides generated

**Error:** Empty presentation or error

**Solution:**

1. Check document has content
2. Try simpler document (plain text)
3. Check backend logs for errors
4. Verify SlideSpeak API response

---

### Issue: Wrong number of slides

**Problem:** Not getting 3 slides

**Solution:**

Check `backend/services/slidespeak_service.py`:
```python
length=3,  # Make sure this is set
```

Verify custom instructions don't override:
```python
custom_user_instructions="Do not include table of contents. Generate exactly 3 slides."
```

---

### Issue: Table of contents appears

**Problem:** Presentation includes TOC despite settings

**Solution:**

Strengthen custom instruction in `backend/services/slidespeak_service.py`:
```python
instructions = "IMPORTANT: Do not include a table of contents slide. Start directly with content slides. Generate exactly 3 content slides only."
```

---

### Issue: No branding applied

**Problem:** Logo/fonts not appearing

**Solution:**

1. Configure branding in SlideSpeak dashboard:
   - Log in to SlideSpeak
   - Go to Brand Settings
   - Upload logo
   - Set brand fonts

2. Verify settings in code:
```python
use_branding_logo=True,
use_branding_fonts=True,
```

3. Clear SlideSpeak cache (in dashboard)

---

### Issue: Images not included

**Problem:** Slides have no images

**Solution:**

Check settings:
```python
fetch_images=True,  # For stock images
use_document_images=True,  # For document images
```

In frontend:
```javascript
fetch_images: true  // Make sure checkbox is checked
```

---

## Performance Issues

### Issue: Slow generation

**Problem:** Takes longer than 2 minutes

**Solution:**

1. **Optimize document:**
   - Reduce file size
   - Remove unnecessary images
   - Simplify content

2. **Check API status:**
   - SlideSpeak status page
   - OpenAI status page

3. **Implement async processing:**

In `backend/services/slidespeak_service.py`:
```python
synchronous=False,  # Use async
```

Then poll for status:
```python
task_id = response.data.task_id
# Poll /task-status/{task_id}
```

---

### Issue: High memory usage

**Problem:** Backend using too much RAM

**Solution:**

1. **Limit concurrent requests:**

Add rate limiting:
```bash
pip install slowapi
```

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)
@app.post("/upload-and-generate")
@limiter.limit("5/minute")
```

2. **Process files in chunks**

3. **Add memory limits in Docker:**
```yaml
services:
  backend:
    mem_limit: 512m
```

---

## Development Issues

### Issue: Hot reload not working

**Problem:** Changes don't reflect

**Frontend Solution:**
```bash
# Restart Vite
npm run dev
```

**Backend Solution:**
```bash
# Use --reload flag
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### Issue: Environment variables not loading

**Problem:** Changes to .env not taking effect

**Solution:**

1. Restart the server
2. Check .env file location (must be in same directory as code)
3. Verify no typos in variable names
4. Check no quotes around values (usually)

```bash
# Correct
SLIDESPEAK_API_KEY=abc123

# Incorrect
SLIDESPEAK_API_KEY="abc123"
```

---

## Production Issues

### Issue: 500 errors in production

**Solution:**

1. **Check logs:**
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Docker
docker logs container_name
```

2. **Verify environment variables are set**

3. **Check dependencies are installed**

4. **Verify API keys are valid**

---

### Issue: Static files not loading

**Solution:**

For Vite build:
```bash
cd frontend
npm run build
# Verify dist/ folder was created
```

Configure static file serving:
```python
# In main.py
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="dist", html=True), name="static")
```

---

### Issue: HTTPS mixed content errors

**Problem:** HTTPS site loading HTTP resources

**Solution:**

1. **Use HTTPS for all resources:**
```bash
# frontend/.env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

2. **Configure HTTPS redirect:**
```python
# In main.py
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)
```

---

## Debugging Tips

### Enable Debug Logging

**Backend:**
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# In your code
logger.debug(f"Processing file: {file.filename}")
logger.debug(f"Response from SlideSpeak: {response.json()}")
```

**Frontend:**
```javascript
// In App.jsx
console.log('Upload state:', { status, message, progress })
console.log('API response:', response.data)
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload a file
4. Check each request:
   - Status code (should be 200)
   - Response body
   - Request headers
   - Response time

### Test API Directly

Use curl or Postman:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test upload (replace with real file)
curl -X POST http://localhost:8000/upload-and-generate \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.pdf" \
  -F "tone=professional"
```

### Use API Documentation

Visit `http://localhost:8000/docs` for interactive API testing.

---

## Getting Help

### Before asking for help:

1. ✅ Check this troubleshooting guide
2. ✅ Check browser console for errors
3. ✅ Check backend logs
4. ✅ Verify environment variables
5. ✅ Try with a simple test file
6. ✅ Test API endpoints directly

### Include in bug reports:

- Error message (full text)
- Steps to reproduce
- Browser/OS version
- Backend logs
- Frontend console logs
- File type being uploaded
- Screenshot (if UI issue)

### Resources:

- **SlideSpeak Docs:** https://docs.slidespeak.co/
- **OpenAI Docs:** https://platform.openai.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/

---

## Common Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid file type or parameters |
| 401 | Unauthorized | Invalid API key |
| 403 | Forbidden | CORS issue or blocked request |
| 404 | Not Found | Wrong endpoint URL |
| 413 | Payload Too Large | File size exceeds limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Backend crash or API error |
| 502 | Bad Gateway | Backend not responding |
| 503 | Service Unavailable | Server overloaded |
| 504 | Gateway Timeout | Request took too long |

---

## Still Having Issues?

1. Create a minimal test case
2. Check if issue occurs with example file
3. Review all documentation
4. Check external API status pages
5. Consider posting issue with full details

Remember: Most issues are configuration-related. Double-check environment variables, API keys, and CORS settings first!

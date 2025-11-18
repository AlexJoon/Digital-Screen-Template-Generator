# Quick Start Guide

Get the SlideSpeak Ingestion Tool running in 5 minutes!

## Prerequisites

- Python 3.9+
- Node.js 18+
- SlideSpeak API Key: `d918b19f-f2d8-4c9e-a2e4-f66ab3bd3557`
- OpenAI API Key (replace placeholder in `.env`)

## Option 1: Automated Setup (macOS/Linux)

```bash
chmod +x start.sh
./start.sh
```

This script will:
1. Create Python virtual environment
2. Install backend dependencies
3. Start FastAPI server on port 8000
4. Install frontend dependencies
5. Start Vite dev server on port 5173

## Option 2: Manual Setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key (SlideSpeak key is already set)

# Start server
python main.py
```

Backend runs at: `http://localhost:8000`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Testing the Tool

1. Open browser to `http://localhost:5173`
2. Drag and drop a document (PDF, Word, or text file)
3. Optionally configure advanced options
4. Click "Generate Presentation"
5. Wait for processing (up to 2 minutes)
6. Download your branded 3-slide PowerPoint!

## Embedding in iframe

Open `iframe-example.html` in a browser to see how the tool looks when embedded.

To embed on your site:

```html
<iframe
  src="http://localhost:5173"
  width="100%"
  height="700px"
  frameborder="0"
></iframe>
```

## API Documentation

Once the backend is running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Configuration

### Customize Slide Output

Edit `backend/services/slidespeak_service.py` to modify:
- Number of slides (currently 3)
- Tone options
- Verbosity settings
- Image inclusion
- Branding options

### Customize UI

Edit files in `frontend/src/`:
- `App.jsx`: Main application logic
- `components/UploadForm.jsx`: Upload interface
- `components/StatusDisplay.jsx`: Progress display
- `index.css` & `tailwind.config.js`: Styling

## Next Steps

1. **Add OpenAI API Key**: Replace placeholder in `backend/.env`
2. **Configure Branding**: Set up brand assets in SlideSpeak dashboard
3. **Test Different Files**: Try various document types
4. **Customize Styling**: Adjust colors and layout to match your brand
5. **Deploy**: Follow deployment guide in main README.md

## Troubleshooting

### Port Already in Use

If ports 8000 or 5173 are in use:

**Backend (change port 8000):**
```python
# In backend/main.py, change:
uvicorn.run(app, host="0.0.0.0", port=8001)  # Use different port
```

**Frontend (change port 5173):**
```javascript
// In frontend/vite.config.js, change:
server: { port: 5174 }
```

### CORS Errors

Ensure `backend/.env` includes your frontend URL:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### OpenAI Errors (Placeholder Key)

The app will still work without a valid OpenAI key, but text synthesis will be skipped. Update `backend/.env` with your real key for full functionality.

## Support

- Check `README.md` for detailed documentation
- Visit SlideSpeak docs: https://docs.slidespeak.co/
- Check API logs in terminal for error messages

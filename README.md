# Campus Event Slide Generator

A streamlined tool for campus staff to create professional 3-slide event presentations optimized for digital screens across campus. Upload event content and generate ready-to-display PowerPoint slides formatted for digital signage.

## Features

- **Event Content Upload**: Support for PDF, Word, PowerPoint, and text files with event information
- **AI-Powered Optimization**: OpenAI processes content specifically for digital screen display
- **SlideSpeak Integration**: Automatic generation of 3-slide presentations optimized for campus digital screens
- **Custom Branded Template**: Uses your pre-configured SlideSpeak template (ID: `cm6iali9y000njl03qw4hvuk3`)
- **Digital Screen Format**: 16:9 widescreen with large, readable text and high contrast
- **Staff-Friendly Interface**: Simple workflow designed for busy center and program office staff
- **Real-time Progress**: Live upload and processing status updates
- **Consistent Branding**: Every presentation uses your branded template automatically

## Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **Python 3.9+**: Core runtime
- **httpx**: Async HTTP client for API calls
- **OpenAI SDK**: AI text synthesis
- **Pydantic**: Data validation and settings management

### Frontend
- **React 18**: UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

## Project Structure

```
slidespeak-tool/
├── backend/
│   ├── services/
│   │   ├── __init__.py
│   │   ├── openai_service.py      # OpenAI integration
│   │   └── slidespeak_service.py  # SlideSpeak API integration
│   ├── config.py                   # Configuration management
│   ├── main.py                     # FastAPI application
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Environment variables (not in git)
│   └── .env.example                # Environment template
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UploadForm.jsx      # File upload component
    │   │   └── StatusDisplay.jsx   # Status and progress display
    │   ├── App.jsx                 # Main application
    │   ├── main.jsx                # Entry point
    │   └── index.css               # Global styles
    ├── index.html                  # HTML template
    ├── package.json                # Node dependencies
    ├── vite.config.js              # Vite configuration
    ├── tailwind.config.js          # Tailwind configuration
    ├── .env                        # Environment variables (not in git)
    └── .env.example                # Environment template
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- SlideSpeak API key
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
```

5. Edit `.env` and add your API keys:
```
SLIDESPEAK_API_KEY=your_slidespeak_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

6. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` if needed (default points to `http://localhost:8000`):
```
VITE_API_BASE_URL=http://localhost:8000
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Basic Workflow

1. **Upload Document**: Drag and drop or click to select a document (PDF, Word, PowerPoint, or text file)
2. **Configure Options** (Optional): Set tone, verbosity, and other presentation parameters
3. **Generate**: Click "Generate Presentation" to start the process
4. **Download**: Once complete, download your branded 3-slide PowerPoint presentation

### Advanced Options

- **Tone**: Choose from professional, casual, funny, educational, or sales pitch
- **Verbosity**: Select concise, standard, or text-heavy content
- **Include Images**: Toggle stock image inclusion
- **Custom Instructions**: Add specific requirements for your presentation

### API Endpoints

#### POST `/upload-and-generate`
Upload a document and generate a presentation.

**Parameters:**
- `file`: The document file (multipart/form-data)
- `tone`: Presentation tone (default: "professional")
- `verbosity`: Content verbosity (default: "standard")
- `language`: Presentation language (default: "en")
- `fetch_images`: Include stock images (default: true)
- `custom_instructions`: Additional instructions (optional)

**Response:**
```json
{
  "status": "success",
  "message": "Presentation generated successfully",
  "download_url": "https://..."
}
```

#### GET `/task-status/{task_id}`
Check the status of an async generation task.

#### GET `/health`
Health check endpoint.

## Embedding as iframe

The application is designed to be embedded as an iframe:

```html
<iframe
  src="http://localhost:5173"
  width="100%"
  height="800px"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>
```

### Production Deployment

For production, update CORS settings in `backend/.env`:
```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

And update the frontend API URL in `frontend/.env`:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Configuration

### Presentation Settings

The tool is configured to generate:
- **Exactly 3 slides** (excluding table of contents)
- **No table of contents** (custom instruction to skip it)
- **Branded slides** with your SlideSpeak brand settings (logo and fonts)
- **PowerPoint format** (.pptx) output

### Branding

Brand settings (logo, fonts, colors) are configured in your SlideSpeak account:
1. Log in to SlideSpeak
2. Go to Brand Settings
3. Upload your brand logo
4. Configure brand fonts and colors

These settings will be automatically applied to all generated presentations.

## Development

### Building for Production

**Backend:**
```bash
# The backend runs as-is with uvicorn in production
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
npm run build
```

The built files will be in the `dist` directory.

### Testing

Upload a sample document and verify:
- File upload works correctly
- Progress indicators display properly
- OpenAI synthesis processes the content
- SlideSpeak generates exactly 3 slides
- Branding is applied correctly
- Download works in iframe context

## Troubleshooting

### Backend Issues

- **CORS errors**: Verify CORS_ORIGINS in `.env` includes your frontend URL
- **API key errors**: Check that your SlideSpeak and OpenAI API keys are valid
- **Timeout errors**: Large files may take longer; consider increasing timeout values

### Frontend Issues

- **Cannot connect to backend**: Verify VITE_API_BASE_URL points to the correct backend URL
- **Iframe issues**: Ensure parent page and iframe are served over the same protocol (both HTTP or both HTTPS)

## API Keys

### SlideSpeak API
Your API key: `d918b19f-f2d8-4c9e-a2e4-f66ab3bd3557`

### OpenAI API
Replace the placeholder key in `backend/.env` with your actual OpenAI API key.

## License

MIT License - Feel free to modify and use for your projects.

## Support

For issues with:
- SlideSpeak API: [SlideSpeak Documentation](https://docs.slidespeak.co/)
- OpenAI API: [OpenAI Documentation](https://platform.openai.com/docs)

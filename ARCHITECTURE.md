# Architecture Documentation

This document describes the architecture of the CBS Digital Screen Generator ("Doug"), a full-stack application built with:

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Python 3.9+ with FastAPI
- **Image Processing**: Pillow (PIL) + python-pptx
- **External APIs**: OpenAI GPT-4o Vision, Hive API

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   CBS Digital Screen Generator               │
│                        "Doug" Frontend                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ UploadForm   │  │    App.jsx   │  │StatusDisplay │      │
│  │  Component   │──│  (Main App)  │──│  Component   │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                           │                                  │
│  ┌──────────────┐  ┌──────┴───────┐  ┌──────────────┐      │
│  │ SlidePreview │  │  FormInput   │  │FileUploadInput│     │
│  │  (QR Code)   │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│                    React + Vite + Tailwind                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/REST API (Axios)
                             │
┌────────────────────────────▼────────────────────────────────┐
│                  CBS Digital Screen Generator                │
│                    Backend (Python 3.9+)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    main.py                            │   │
│  │              (FastAPI Application)                    │   │
│  │                                                       │   │
│  │  Endpoints:                                          │   │
│  │  - POST /upload-metadata                             │   │
│  │  - POST /export (PNG/JPG/PPTX)                       │   │
│  │  - POST /submit-to-hive                              │   │
│  │  - GET  /health                                       │   │
│  └───────────────────┬──────────────┬───────────────────┘   │
│                      │              │                        │
│         ┌────────────▼──────┐  ┌───▼──────────────┐        │
│         │  openai_service   │  │  Export Service  │        │
│         │                   │  │                   │        │
│         │ - analyze_image   │  │ - PNG Exporter   │        │
│         │ - format_metadata │  │ - JPG Exporter   │        │
│         └───────────────────┘  │ - PPTX Exporter  │        │
│                                └──────┬───────────┘        │
│                                       │                     │
│                              ┌────────▼───────────┐        │
│                              │   Hive Service     │        │
│                              │                    │        │
│                              │ - submit_request   │        │
│                              │ - attach_file      │        │
│                              └────────────────────┘        │
└────────────────────────────────────────────────────────────┘
                   │                     │
                   │                     │
       ┌───────────▼────────┐  ┌─────────▼──────────┐
       │    OpenAI API      │  │     Hive API       │
       │                    │  │                    │
       │ - GPT-4o Vision    │  │ - Create Actions   │
       │ - Image Analysis   │  │ - Attach Files     │
       │                    │  │ - MarComms Project │
       └────────────────────┘  └────────────────────┘
```

## Data Flow

### 1. Metadata Submission Flow

```
User → UploadForm → App.jsx → FormData → Backend API
                                              ↓
                                    /upload-metadata
                                              ↓
                                    Validate metadata
                                              ↓
                                    Analyze image (if present)
                                        via GPT-4o Vision
                                              ↓
                                    Format metadata summary
                                              ↓
                                    Store in session
                                              ↓
                                    Return summary to frontend
```

### 2. Slide Export Flow

```
User selects template + format → App.jsx → Backend API
                                              ↓
                                       /export endpoint
                                              ↓
                                    Get slide data from session
                                              ↓
                                    Select exporter by format:
                                    ├─ PNG → PNGExporter
                                    ├─ JPG → JPGExporter
                                    └─ PPTX → PPTXExporter
                                              ↓
                                    Render slide locally:
                                    - Gradient background
                                    - Text layout
                                    - Circular image
                                    - QR code (if publication link)
                                              ↓
                                    Return binary file
                                              ↓
                                    Frontend downloads
```

### 3. Hive Submission Flow

```
User clicks "Submit to Hive" → App.jsx → Backend API
                                              ↓
                                       /submit-to-hive
                                              ↓
                                    Export slide as PNG
                                              ↓
                                    Create Hive action in
                                    MarComms Service Requests
                                              ↓
                                    Attach PNG to action
                                              ↓
                                    Return action URL
                                              ↓
                                    Frontend shows success +
                                    link to Hive
```

### 4. QR Code Generation

```
Publication Link (user input)
         ↓
    Validate URL
         ↓
    Generate QR code:
    ├─ Frontend: qrcode.react (preview)
    └─ Backend: qrcode library (export)
         ↓
    Embed in slide render
```

## Component Architecture

### Frontend Components

```
App.jsx (Main Container)
├── State Management
│   ├── status: 'idle' | 'processing' | 'review' | 'generating' | 'success' | 'error'
│   ├── message: string
│   ├── metadataSummary: string | null
│   ├── uploadOptions: object | null
│   ├── selectedTemplate: 'template1' | 'template2' | 'template3'
│   ├── selectedFormat: 'pptx' | 'png' | 'jpg'
│   ├── exportedFile: { url, filename, format } | null
│   └── hiveSubmission: { submitting, success, actionUrl, error } | null
│
├── Event Handlers
│   ├── handleFormSubmit()
│   ├── handleExport()
│   ├── handleDownload()
│   ├── handleReset()
│   └── handleSubmitToHive()
│
└── Child Components
    ├── UploadForm (when status === 'idle')
    │   ├── FormInput components (headline, caption, description, etc.)
    │   ├── FileUploadInput (image upload)
    │   └── Submit button
    │
    ├── StatusDisplay (processing/generating states)
    │   ├── Loading spinner
    │   ├── Progress bar
    │   └── Status message
    │
    └── Review/Success Views
        ├── Metadata summary
        ├── SlidePreview (with QR code)
        ├── Template selector
        ├── Format selector
        ├── Download button
        └── Hive submission section
```

### Backend Services (Python)

The backend is built entirely in Python, using FastAPI as the web framework. All slide generation, image processing, and API integrations are handled by Python services.

```
main.py (FastAPI App - Python)
├── CORS Middleware
├── Session storage (_metadata_store)
├── API Endpoints
│   ├── POST /upload-metadata
│   ├── POST /export
│   ├── POST /generate (legacy)
│   ├── POST /submit-to-hive
│   ├── GET /hive/projects
│   └── GET /health
│
services/ (Python modules)
├── openai_service.py          # OpenAI SDK integration
│   └── OpenAIService
│       ├── synthesize_text(): Format document text
│       ├── analyze_image(): GPT-4o Vision analysis
│       └── format_metadata_summary(): Human-readable summary
│
├── exporters/                 # Slide generation (Pillow + python-pptx)
│   ├── base.py
│   │   ├── SlideData (dataclass)
│   │   ├── TemplateConfig (dataclass)
│   │   └── BaseExporter (ABC)
│   │
│   ├── export_service.py
│   │   └── ExportService
│   │       ├── get_exporter(): Factory method
│   │       └── export(): Generate slide
│   │
│   ├── image_exporter.py      # PNG/JPG export using Pillow
│   │   ├── BaseImageExporter
│   │   │   ├── _create_gradient()     # NumPy-accelerated
│   │   │   ├── _draw_text_wrapped()
│   │   │   ├── _add_circular_image()
│   │   │   ├── _generate_qr_code()    # qrcode library
│   │   │   └── _render_slide()
│   │   ├── PNGExporter
│   │   └── JPGExporter
│   │
│   └── pptx_exporter.py       # PowerPoint export using python-pptx
│       └── PPTXExporter
│           ├── _add_gradient_background()
│           ├── _add_text_box()
│           ├── _add_circular_image()
│           ├── _add_qr_code()
│           └── export()
│
└── hive/                      # Hive API integration (httpx)
    ├── hive_client.py
    │   └── HiveClient
    │       ├── create_action()
    │       ├── attach_file()
    │       └── get_projects()
    │
    └── hive_service.py
        └── HiveService
            └── submit_slide_request()

models/ (Pydantic models)
└── slide_metadata.py
    └── SlideMetadata (Pydantic model for validation)
```

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.11 | Build tool & dev server |
| Tailwind CSS | 3.4.1 | Styling framework |
| Axios | 1.6.5 | HTTP client |
| qrcode.react | 4.x | QR code preview |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.109.0 | Web framework |
| Uvicorn | 0.27.0 | ASGI server |
| Python | 3.9+ | Runtime |
| python-pptx | 1.0.0 | PowerPoint generation |
| Pillow | 10.x | Image processing |
| qrcode | 7.x | QR code generation |
| numpy | 1.x | Fast gradient rendering |
| httpx | 0.26.0 | Async HTTP client |
| OpenAI | 1.10.0 | GPT-4o Vision API |

## Export System

### Template Configurations

```python
TEMPLATES = {
    "template1": {  # CBS Blue
        "background_color": "#003DA5",
        "background_gradient_end": "#0052CC",
        "text_color": "#FFFFFF",
        "accent_color": "#009bdb"
    },
    "template2": {  # Dark Theme
        "background_color": "#1a1a1a",
        "background_gradient_end": "#2d2d2d",
        "text_color": "#FFFFFF",
        "accent_color": "#009bdb"
    },
    "template3": {  # Light Theme
        "background_color": "#f8f9fa",
        "background_gradient_end": "#e9ecef",
        "text_color": "#181a1c",
        "accent_color": "#003DA5"
    }
}
```

### Slide Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Caption (uppercase, small)                                   │
│                                                              │
│ ┌─────────────────────────────┐  ┌──────────────────────┐  │
│ │                             │  │    ┌──────────┐      │  │
│ │  HEADLINE                   │  │    │  Image   │      │  │
│ │  (Large, Bold)              │  │    │ (Circle) │      │  │
│ │                             │  │    └──────────┘      │  │
│ │  Description text here...   │  │                      │  │
│ │                             │  │    ┌──────────┐      │  │
│ │                             │  │    │ QR Code  │      │  │
│ │                             │  │    └──────────┘      │  │
│ │                             │  │   Scan for more      │  │
│ └─────────────────────────────┘  └──────────────────────┘  │
│                                                              │
│ Author Name (accent color)                                   │
│ Columbia Business School                                     │
└─────────────────────────────────────────────────────────────┘
```

## API Specifications

### Internal API Endpoints

**POST /upload-metadata**
```json
Request (multipart/form-data):
{
  "slide_category": "string",
  "headline": "string",
  "caption": "string (optional)",
  "description": "string",
  "author_name": "string (optional)",
  "publication_link": "string (optional)",
  "image": "file (optional)"
}

Response:
{
  "status": "success",
  "metadata_summary": "Formatted human-readable summary...",
  "session_id": "uuid"
}
```

**POST /export**
```json
Request:
{
  "headline": "string",
  "description": "string",
  "caption": "string (optional)",
  "author_name": "string (optional)",
  "publication_link": "string (optional)",
  "template_id": "template1",
  "session_id": "uuid"
}

Query: ?format=pptx|png|jpg

Response: Binary file with Content-Disposition header
```

**POST /submit-to-hive**
```json
Request:
{
  "headline": "string",
  "description": "string",
  "caption": "string (optional)",
  "author_name": "string (optional)",
  "publication_link": "string (optional)",
  "template_id": "template1",
  "session_id": "uuid",
  "export_format": "png"
}

Response:
{
  "success": true,
  "action_id": "hive-action-id",
  "action_url": "https://hive.com/...",
  "error": null
}
```

### External API Integrations

**OpenAI GPT-4o Vision** (Image Analysis)
```python
model = "gpt-4o"
messages = [{
    "role": "user",
    "content": [
        {"type": "text", "text": "Describe this image..."},
        {"type": "image_url", "image_url": {"url": "data:image/...;base64,..."}}
    ]
}]
```

**Hive API**
```
Base URL: https://app.hive.com/api/v1

POST /actions/create - Create action in project
POST /actions/{id}/attach - Attach file to action
GET /projects - List available projects
```

## Configuration

### Environment Variables

**Backend (.env):**
```bash
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Hive API
HIVE_API_KEY=...
HIVE_USER_ID=...
HIVE_WORKSPACE_ID=...
HIVE_DEFAULT_PROJECT_ID=...  # MarComms Service Requests
```

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Security

### API Key Protection
- All external API keys stored in backend .env
- Never exposed to frontend
- Hive credentials for MarComms submission only

### CORS Configuration
- Restricted to configured origins
- Development: localhost:5173, localhost:3000
- Production: Specific domain only

### File Validation
- Image uploads validated by MIME type
- Allowed: JPEG, PNG, GIF, WebP
- Size limits enforced

## Performance

### Local Generation Benefits
- No external API latency for slide generation
- Instant exports (< 1 second)
- Works offline (except image analysis)
- No rate limits on exports

### Optimizations
- NumPy-accelerated gradient rendering
- Async image analysis
- Session-based metadata storage
- Efficient binary streaming for downloads

## Deployment

### Development
```
localhost:5173 (Frontend - Vite)
      ↓
localhost:8000 (Backend - Uvicorn)
      ↓
External APIs (OpenAI, Hive)
```

### Production (Railway)

The application is deployed using Railway with two separate services:

```
┌─────────────────────────────────────────────────────────────┐
│                      Railway Platform                        │
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │   Frontend Service  │    │   Backend Service   │        │
│  │                     │    │                     │        │
│  │  - React/Vite       │───▶│  - FastAPI          │        │
│  │  - Static files     │    │  - Uvicorn          │        │
│  │  - Served by serve  │    │  - Python 3.9+      │        │
│  │                     │    │                     │        │
│  │  railway.toml       │    │  Procfile           │        │
│  │  .env.example       │    │  railway.toml       │        │
│  └─────────────────────┘    │  .env.example       │        │
│                              └──────────┬──────────┘        │
│                                         │                    │
└─────────────────────────────────────────┼────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
           ┌────────▼────────┐   ┌────────▼────────┐           │
           │   OpenAI API    │   │    Hive API     │           │
           │   (GPT-4o)      │   │  (MarComms)     │           │
           └─────────────────┘   └─────────────────┘           │
```

### Deployment Files

```
backend/
├── Procfile              # web: uvicorn main:app --host 0.0.0.0 --port $PORT
├── railway.toml          # Railway-specific configuration
├── requirements.txt      # Python dependencies
└── .env.example          # Environment variable template

frontend/
├── railway.toml          # Railway-specific configuration
├── package.json          # Node dependencies
└── .env.example          # Environment variable template
```

### Production Environment Variables

**Backend Service:**
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o Vision |
| `FRONTEND_URL` | Yes | Production frontend URL for CORS |
| `HIVE_API_KEY` | No | Hive API key for MarComms integration |
| `HIVE_USER_ID` | No | Hive user ID |
| `HIVE_WORKSPACE_ID` | No | Hive workspace ID |
| `HIVE_DEFAULT_PROJECT_ID` | No | Default Hive project for submissions |

**Frontend Service:**
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL |

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Future Enhancements

1. **Additional Templates** - More CBS-branded designs
2. **Batch Export** - Generate multiple formats at once
3. **User Authentication** - Track usage per user
4. **Template Editor** - Custom template creation
5. **Analytics Dashboard** - Track slide generation metrics

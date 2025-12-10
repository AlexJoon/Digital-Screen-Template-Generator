# Architecture Documentation

This document describes the architecture of the CBS Digital Screen Generator ("Doug"), a full-stack application built with:

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Python 3.9+ with FastAPI
- **Image Processing**: Pillow (PIL) + python-pptx
- **External APIs**: OpenAI GPT-4o Vision

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
│  │  - POST /process-metadata                            │   │
│  │  - POST /analyze-and-crop-image                      │   │
│  │  - POST /export (PNG/JPG/PPTX)                       │   │
│  │  - GET  /health                                       │   │
│  └───────────────────┬──────────────┬───────────────────┘   │
│                      │              │                        │
│         ┌────────────▼──────┐  ┌───▼──────────────┐        │
│         │  openai_service   │  │  Export Service  │        │
│         │                   │  │                   │        │
│         │ - analyze_image   │  │ - PNG Exporter   │        │
│         │ - format_metadata │  │ - JPG Exporter   │        │
│         └───────────────────┘  │ - PPTX Exporter  │        │
│                                └──────────────────┘        │
└────────────────────────────────────────────────────────────┘
                   │
                   │
       ┌───────────▼────────┐
       │    OpenAI API      │
       │                    │
       │ - GPT-4o Vision    │
       │ - Image Analysis   │
       └────────────────────┘
```

## Data Flow

### 1. Metadata Submission Flow

```
User → UploadForm → App.jsx → FormData → Backend API
                                              ↓
                                    /process-metadata
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
User clicks "Submit to Hive" → Opens Hive form in new tab
                               (https://forms.hive.com/?formId=...)
```

### 4. AI-Powered Face-Centered Image Cropping

```
User uploads image → FileUploadInput component
                              ↓
                    POST /analyze-and-crop-image
                              ↓
                    GPT-4o Vision analyzes image:
                    ├─ Detects face presence
                    ├─ Returns face_center_x (0-1)
                    ├─ Returns face_center_y (0-1)
                    └─ Returns face_size (0-1)
                              ↓
                    crop_image_to_face() in image_utils.py:
                    ├─ If face detected: center crop on face
                    │   with headshot-optimized framing
                    └─ If no face: center crop to square
                              ↓
                    Return base64 cropped image + crop info
                              ↓
                    Frontend shows preview with toggle:
                    ├─ "Use AI-cropped version" (default)
                    └─ "Use original instead"
```

### 5. QR Code Generation

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
│   └── exportedFile: { url, filename, format } | null
│
├── Event Handlers
│   ├── handleFormSubmit()
│   ├── handleExport()
│   ├── handleDownload()
│   ├── handleReset()
│   └── handleSubmitToHive()  # Opens Hive form URL
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
│   ├── POST /process-metadata
│   ├── POST /analyze-and-crop-image  # AI face detection + cropping
│   ├── POST /export
│   └── GET /health
│
services/ (Python modules)
├── openai_service.py          # OpenAI SDK integration
│   └── OpenAIService
│       ├── analyze_image(): GPT-4o Vision analysis
│       ├── detect_face_position(): Face detection for smart cropping
│       └── format_metadata_summary(): Human-readable summary
│
├── image_utils.py             # Image processing utilities
│   └── crop_image_to_face(): AI-powered face-centered cropping
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
│ │  📅 Date | 🕐 Time | 📍 Loc │  │    │ QR Code  │      │  │
│ │  (Events only, accent)      │  │    └──────────┘      │  │
│ │                             │  │   Scan for more      │  │
│ └─────────────────────────────┘  └──────────────────────┘  │
│                                                              │
│ Author Name (accent color)                                   │
│ Columbia Business School                                     │
└─────────────────────────────────────────────────────────────┘
```

## API Specifications

### Internal API Endpoints

**POST /analyze-and-crop-image**
```json
Request (multipart/form-data):
{
  "image": "file (required)"
}

Query: ?output_size=800

Response:
{
  "success": true,
  "has_face": true,
  "cropped_image_base64": "base64-encoded-jpeg...",
  "crop_info": {
    "original_width": 1200,
    "original_height": 800,
    "was_cropped": true,
    "crop_method": "face_centered",
    "face_detection": {
      "has_face": true,
      "face_center_x": 0.45,
      "face_center_y": 0.35,
      "face_size": 0.25
    }
  }
}
```

**POST /process-metadata**
```json
Request (multipart/form-data):
{
  "slide_category": "string",
  "headline": "string",
  "caption": "string (optional)",
  "description": "string",
  "author_name": "string (optional)",
  "publication_link": "string (optional)",
  "image": "file",
  "event_date": "string (optional, for Events)",
  "event_time": "string (optional, for Events)",
  "event_location": "string (optional, for Events)"
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
  "session_id": "uuid",
  "event_date": "string (optional)",
  "event_time": "string (optional)",
  "event_location": "string (optional)"
}

Query: ?format=pptx|png|jpg

Response: Binary file with Content-Disposition header
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

## Configuration

### Environment Variables

**Backend (.env):**
```bash
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Security

### API Key Protection
- All external API keys stored in backend .env
- Never exposed to frontend

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
External APIs (OpenAI)
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
                                 ┌────────▼────────┐
                                 │   OpenAI API    │
                                 │   (GPT-4o)      │
                                 └─────────────────┘
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

**Frontend Service:**
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API URL |

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## UI/UX Design System

### CBS Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| CBS Cyan | `#009bdb` | Accent color, active states, icons |
| CBS Dark | `#181a1c` | Primary buttons, dark backgrounds |
| Gray 500 | `gray-500` | Form borders, inactive elements |
| Blue 50 | `bg-blue-50` | Section backgrounds |

### Form Styling

Form inputs follow a consistent underline-only design pattern:
- **Border**: `border-b-2 border-gray-500` (underline only)
- **Hover**: `hover:border-[#181a1c]`
- **Focus**: `focus:border-[#009bdb]`
- **Transition**: `transition-all duration-300 ease-in-out`
- **Dot Indicator**: Small cyan dot appears when field has value or is focused

### Export Format Buttons

Each format option displays:
- File type icon (cyan, right-aligned)
- Format label and description (left-aligned)
- Selected state: `border-[#009bdb] bg-blue-50`

### Step Timeline

Three-step visual progress indicator:
1. **Enter Info** - Form input step
2. **Select Template** - Template and format selection
3. **Export** - Download and Hive submission

## Future Enhancements

1. **Additional Templates** - More CBS-branded designs
2. **Batch Export** - Generate multiple formats at once
3. **User Authentication** - Track usage per user
4. **Template Editor** - Custom template creation
5. **Analytics Dashboard** - Track slide generation metrics

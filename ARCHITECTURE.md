# Architecture Documentation

This document describes the architecture of the CBS Digital Screen Generator ("Doug"), a full-stack application built with:

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Python 3.9+ with FastAPI
- **Image Processing**: Pillow (PIL) + python-pptx
- **External APIs**: OpenAI GPT-4o Vision

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   CBS Digital Screen Generator                   │
│                        "Doug" Frontend                           │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     App.jsx (Router)                       │  │
│  │  status: idle → processing → review → generating → success │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                    screens/                                │  │
│  │  ┌───────────────┐  ┌───────────────┐                     │  │
│  │  │ ReviewScreen  │  │ SuccessScreen │                     │  │
│  │  │ (Step 2)      │  │ (Step 3)      │                     │  │
│  │  └───────────────┘  └───────────────┘                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    components/                             │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │  │
│  │  │UploadForm  │ │SlidePreview│ │StepTimeline│            │  │
│  │  │(Step 1)    │ │            │ │            │            │  │
│  │  └────────────┘ └────────────┘ └────────────┘            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │  │
│  │  │FormInput   │ │FileUpload  │ │FormatSelect│            │  │
│  │  │            │ │Input       │ │            │            │  │
│  │  └────────────┘ └────────────┘ └────────────┘            │  │
│  │                                                           │  │
│  │  layouts/  ─────────────────────────────────────────────  │  │
│  │  │ CircularLayout │ SplitTextPrimaryLayout │ FullHero │   │  │
│  │  │ MediaVertical  │ PodcastLayout │ CongratsFramed │ ... │  │
│  │  │ shared/ → EventDetails, QRCodeSection              │   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  styles/constants.js ─ sectionStyles, containerStyles            │
│                                                                  │
│                      React + Vite + Tailwind                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 │ HTTP/REST API (Axios)
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                  CBS Digital Screen Generator                    │
│                    Backend (Python 3.9+)                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    main.py                                │   │
│  │              (FastAPI Application)                        │   │
│  │                                                           │   │
│  │  Endpoints:                                               │   │
│  │  - POST /process-metadata                                 │   │
│  │  - POST /analyze-and-crop-image                           │   │
│  │  - POST /export (PNG/JPG/PPTX)                            │   │
│  │  - GET  /health                                           │   │
│  └───────────────────┬──────────────┬───────────────────────┘   │
│                      │              │                            │
│         ┌────────────▼──────┐  ┌───▼──────────────┐             │
│         │  openai_service   │  │  Export Service  │             │
│         │                   │  │                   │             │
│         │ - analyze_image   │  │ - PNG Exporter   │             │
│         │ - format_metadata │  │ - JPG Exporter   │             │
│         └───────────────────┘  │ - PPTX Exporter  │             │
│                                └──────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
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

### Frontend Components (Modularized)

The frontend follows a modular architecture with clear separation of concerns:

```
src/
├── App.jsx (Main Container & State Management)
├── main.jsx (Entry point with routing)
│
├── screens/                    # Screen-level components
│   ├── index.js               # Barrel export
│   ├── ReviewScreen.jsx       # Step 2: Template selection & preview
│   └── SuccessScreen.jsx      # Step 3: Export & Hive submission
│
├── components/                 # Reusable UI components
│   ├── UploadForm.jsx         # Step 1: Main form with category fields
│   ├── FormInput.jsx          # Reusable text input with styling
│   ├── FileUploadInput.jsx    # Image upload with AI crop preview
│   ├── SlidePreview.jsx       # Live slide preview wrapper
│   ├── SlideRender.jsx        # Dedicated render route for exports
│   ├── StatusDisplay.jsx      # Loading/progress states
│   ├── StepTimeline.jsx       # 3-step progress indicator
│   ├── FormatSelector.jsx     # Export format selection
│   │
│   └── layouts/               # Slide layout templates
│       ├── index.js           # Layout exports
│       ├── CircularLayout.jsx          # Circular image layout
│       ├── SplitTextPrimaryLayout.jsx  # Text-focused split layout
│       ├── SplitImagePrimaryLayout.jsx # Image-focused split layout
│       ├── FullHeroLayout.jsx          # Full-width hero image
│       ├── MediaVerticalLayout.jsx     # Vertical media layout
│       ├── MediaWideLayout.jsx         # Wide media layout
│       ├── PodcastLayout.jsx           # Podcast-specific layout
│       ├── CongratsFramedLayout.jsx    # Congratulations with frame
│       ├── NoImageLayout.jsx           # Text-only layout
│       │
│       └── shared/            # Shared layout components
│           ├── index.js
│           ├── EventDetails.jsx    # Event date/time/location display
│           └── QRCodeSection.jsx   # QR code with label
│
├── hooks/                     # Custom React hooks
│   └── (custom hooks)
│
└── styles/                    # Shared style constants
    └── constants.js           # sectionStyles, containerStyles
```

### State Management (App.jsx)

```javascript
// Application state
status: 'idle' | 'processing' | 'review' | 'generating' | 'success' | 'error'
message: string
metadataSummary: string | null
displayedSummary: string        // For streaming text effect
isStreaming: boolean
uploadOptions: object | null
selectedTemplate: string
selectedFormat: 'pptx' | 'png' | 'jpg'
exportedFile: { url, filename, format } | null
categoryTemplates: array       // Templates filtered by category

// Event handlers
handleFormSubmit()             # Process metadata & advance to review
handleExport()                 # Generate slide file
handleDownload()               # Trigger file download
handleReset()                  # Return to initial state
handleGoBackToEdit()           # Return to form with data preserved
handleSubmitToHive()           # Opens Hive form URL
```

### Screen Components

**ReviewScreen** (Step 2):
- Displays metadata summary with streaming text effect
- Template selector filtered by slide category
- Live SlidePreview component
- Export format selector (FormatSelector)
- Navigation buttons (Go Back, Export, Start Over)

**SuccessScreen** (Step 3):
- Download button with file info
- 6-step MarComms submission guide
- "Submit to Hive" button that opens external form

### Shared Styles (constants.js)

```javascript
export const sectionStyles = {
  border: '1px solid #ccc',
  borderRadius: '10px',
  backgroundColor: '#fff',
  padding: '2rem',
}

export const containerStyles = {
  border: '1px solid #ccc',
  borderRadius: '10px',
  boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px',
}
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
| CBS Cyan | `#009bdb` | Accent color, active states, icons, steppers |
| CBS Dark | `#181a1c` | Primary buttons, dark backgrounds, current step |
| Light Blue BG | `#e3f2f8` | Main app background |
| White | `#fff` | Section backgrounds, cards |
| Gray Border | `#ccc` | Section borders, container borders |

### Section Styling

All content sections use consistent styling via `sectionStyles`:
- **Border**: `1px solid #ccc`
- **Border Radius**: `10px`
- **Background**: `#fff` (white)
- **Padding**: `2rem`

Main container uses `containerStyles` with box shadow:
- **Box Shadow**: `rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px`

### Form Styling

Form inputs follow a consistent underline-only design pattern:
- **Border**: `border-b-2 border-gray-500` (underline only)
- **Hover**: `hover:border-[#181a1c]`
- **Focus**: `focus:border-[#009bdb]`
- **Transition**: `transition-all duration-300 ease-in-out`
- **Dot Indicator**: Small cyan dot (`bg-[#009bdb]`) appears on the right

### Dropdown Styling

Dropdowns use rounded border styling:
- **Border**: `border border-gray-300 rounded-lg`
- **Hover**: `hover:border-gray-400`
- **Focus**: `focus:border-[#009bdb]`
- **Icon**: Plus icon in cyan on the right

### Export Format Buttons

Each format option displays:
- File type icon (cyan, right-aligned)
- Format label and description (left-aligned)
- Selected state: `border-[#009bdb] bg-blue-50`

### Step Timeline (3-Step Progress)

Visual progress indicator with larger circles (48px):
1. **Enter Info** - Form input step
2. **Select Template** - Template and format selection
3. **Export** - Download and Hive submission

- **Circle Size**: `w-12 h-12` (48px)
- **Icon Size**: `w-6 h-6` (24px checkmarks)
- **Label Size**: `text-sm` (14px)
- **Current Step**: Dark background (`#181a1c`) with cyan ring
- **Completed Step**: Cyan background with white checkmark
- **Clickable**: Completed steps are clickable to go back

### MarComms Submission Stepper (6-Step Guide)

Horizontal stepper in SuccessScreen showing MarComms submission flow:
1. Open Form
2. Select Digital Screens
3. Select Role
4. Website Promotion?
5. Set Dates
6. **Upload Doug Slide** (bold)

### Loading States

AI image processing loader:
- **Container**: `p-6 bg-white border border-gray-300 rounded-lg`
- **Spinner**: `h-8 w-8 text-[#009bdb] animate-spin`

## Future Enhancements

1. **Additional Templates** - More CBS-branded designs
2. **Batch Export** - Generate multiple formats at once
3. **User Authentication** - Track usage per user
4. **Template Editor** - Custom template creation
5. **Analytics Dashboard** - Track slide generation metrics

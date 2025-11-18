# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Parent Website                          │
│                  (External Website/App)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ iframe embed
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SlideSpeak Tool (Frontend)                 │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ UploadForm   │  │    App.jsx   │  │StatusDisplay │      │
│  │  Component   │──│  (Main App)  │──│  Component   │      │
│  └──────────────┘  └──────┬───────┘  └──────────────┘      │
│                            │                                  │
│                    React + Vite + Tailwind                   │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │ (Axios)
                             │
┌────────────────────────────▼────────────────────────────────┐
│                 SlideSpeak Tool (Backend)                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    main.py                            │   │
│  │              (FastAPI Application)                    │   │
│  │                                                        │   │
│  │  Endpoints:                                           │   │
│  │  - POST /upload-and-generate                          │   │
│  │  - GET  /task-status/{id}                             │   │
│  │  - GET  /health                                        │   │
│  └───────────────────┬──────────────┬────────────────────┘   │
│                      │              │                         │
│         ┌────────────▼──────┐  ┌───▼──────────────┐         │
│         │  openai_service   │  │ slidespeak_service│         │
│         │                   │  │                   │         │
│         │ - synthesize_text │  │ - upload_document │         │
│         │                   │  │ - generate_pres.  │         │
│         └────────┬──────────┘  │ - get_task_status │         │
│                  │              │ - download_pres.  │         │
│                  │              └──────┬────────────┘         │
└──────────────────┼─────────────────────┼────────────────────┘
                   │                     │
                   │                     │
       ┌───────────▼────────┐  ┌─────────▼──────────┐
       │    OpenAI API      │  │   SlideSpeak API   │
       │                    │  │                     │
       │ - GPT-4 Turbo      │  │ - Document Upload  │
       │ - Text Synthesis   │  │ - Presentation Gen │
       │                    │  │ - Task Management  │
       └────────────────────┘  └────────────────────┘
```

## Data Flow

### 1. Document Upload Flow

```
User → UploadForm → App.jsx → FormData → Backend API
                                              ↓
                                    /upload-and-generate
                                              ↓
                                    Validate file type
                                              ↓
                                    Read file content
                                              ↓
                                    SlideSpeak Service
                                              ↓
                                    Upload to SlideSpeak
                                              ↓
                                    Return document_uuid
```

### 2. Text Synthesis Flow

```
Document Content → OpenAI Service → GPT-4 API
                                        ↓
                                    Synthesize
                                        ↓
                                  Optimized Text
                                        ↓
                                  Return to Backend
```

### 3. Presentation Generation Flow

```
Synthesized Text + document_uuid → SlideSpeak Service
                                          ↓
                                    Build payload:
                                    - plain_text
                                    - document_uuids
                                    - length: 3
                                    - tone
                                    - verbosity
                                    - custom_instructions
                                    - use_branding_logo: true
                                    - use_branding_fonts: true
                                          ↓
                                    POST to SlideSpeak API
                                          ↓
                                    Wait for completion
                                    (synchronous: true)
                                          ↓
                                    Return download_url
                                          ↓
                                    Send to Frontend
                                          ↓
                                    User downloads .pptx
```

### 4. Progress Tracking Flow

```
Frontend                          Backend

Start Upload
    ↓
setStatus('uploading')
setProgress(20%)
    ↓                                ↓
Upload File ──────────────────→ Receive File
    ↓                                ↓
setProgress(40%)              Upload to SlideSpeak
setStatus('processing')             ↓
    ↓                           Synthesize Text
setProgress(60%)                    ↓
    ↓                           Generate Slides
setProgress(80%)                    ↓
    ↓                           Return URL
setProgress(100%) ←───────────── Response
setStatus('success')
    ↓
Display Download Button
```

## Component Architecture

### Frontend Components

```
App.jsx (Main Container)
├── State Management
│   ├── status: 'idle' | 'uploading' | 'processing' | 'success' | 'error'
│   ├── message: string
│   ├── downloadUrl: string | null
│   └── progress: number (0-100)
│
├── Event Handlers
│   ├── handleFileUpload()
│   ├── pollTaskStatus()
│   ├── handleDownload()
│   └── handleReset()
│
└── Child Components
    ├── UploadForm (when status === 'idle')
    │   ├── File drop zone
    │   ├── Advanced options
    │   └── Submit button
    │
    └── StatusDisplay (when status !== 'idle')
        ├── Status icon
        ├── Progress bar
        └── Status message
```

### Backend Services

```
main.py (FastAPI App)
├── CORS Middleware
├── API Endpoints
│   ├── POST /upload-and-generate
│   ├── GET /task-status/{task_id}
│   ├── GET /download/{url}
│   └── GET /health
│
services/
├── openai_service.py
│   └── OpenAIService
│       ├── __init__(): Initialize OpenAI client
│       └── synthesize_text(): Process document text
│
└── slidespeak_service.py
    └── SlidesSpeakService
        ├── __init__(): Initialize API config
        ├── upload_document(): Upload to SlideSpeak
        ├── generate_presentation(): Create slides
        ├── get_task_status(): Check async status
        └── download_presentation(): Download file
```

## Technology Stack Details

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.11 | Build tool & dev server |
| Tailwind CSS | 3.4.1 | Styling framework |
| Axios | 1.6.5 | HTTP client |
| PostCSS | 8.4.33 | CSS processing |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.109.0 | Web framework |
| Uvicorn | 0.27.0 | ASGI server |
| Python | 3.9+ | Runtime |
| httpx | 0.26.0 | Async HTTP client |
| OpenAI | 1.10.0 | AI SDK |
| Pydantic | 2.5.3 | Validation |

## API Specifications

### SlideSpeak API Integration

**Base URL:** `https://api.slidespeak.co/api/v1`

**Authentication:**
```python
headers = {
    "x-api-key": "your-api-key",
    "Content-Type": "application/json"
}
```

**Endpoints Used:**

1. **Upload Document**
   ```
   POST /document/upload
   Content-Type: multipart/form-data
   Body: { file: <binary> }
   Response: { document_uuid: "..." }
   ```

2. **Generate Presentation**
   ```
   POST /presentation/generate
   Content-Type: application/json
   Body: {
     plain_text: string,
     document_uuids: string[],
     length: 3,
     tone: string,
     verbosity: string,
     use_branding_logo: true,
     use_branding_fonts: true,
     synchronous: true,
     response_format: "powerpoint"
   }
   Response: { download_url: "..." }
   ```

3. **Task Status**
   ```
   GET /task_status/{task_id}
   Response: {
     status: "completed" | "processing" | "failed",
     download_url: "..."
   }
   ```

### OpenAI API Integration

**Model:** GPT-4 Turbo Preview

**Request:**
```python
{
  "model": "gpt-4-turbo-preview",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert presentation synthesizer..."
    },
    {
      "role": "user",
      "content": "Transform this content: ..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

## Configuration Management

### Environment Variables

**Backend (.env):**
```bash
SLIDESPEAK_API_KEY=d918b19f-f2d8-4c9e-a2e4-f66ab3bd3557
OPENAI_API_KEY=sk-placeholder-key
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Configuration Flow

```
.env file → config.py → Settings class → Pydantic validation
                              ↓
                        settings object
                              ↓
                    Available throughout app
```

## Security Architecture

### 1. Authentication Flow

```
Frontend Request
    ↓
Backend receives
    ↓
Extract API keys from config
    ↓
Add to headers
    ↓
Forward to external API
    ↓
Never expose keys to frontend
```

### 2. CORS Configuration

```
Browser Request
    ↓
Check Origin
    ↓
Is origin in CORS_ORIGINS?
    ├─ Yes → Allow request
    └─ No → Block request (403)
```

### 3. File Validation

```
File Upload
    ↓
Check MIME type
    ↓
Is in allowed_types?
    ├─ Yes → Process
    └─ No → Reject (400)
```

## Error Handling

### Frontend Error States

```
try {
  Upload & Process
} catch (error) {
  ├─ error.response → API error
  │   └─ Display: error.response.data.detail
  ├─ error.request → Network error
  │   └─ Display: "Network error. Check connection."
  └─ error.message → Other error
      └─ Display: error.message
}
```

### Backend Error Handling

```
Request → Validate → Process
              ↓           ↓
            Error?    Success?
              ↓           ↓
        HTTPException  Return data
              ↓
        status_code + detail
              ↓
          Frontend
```

## Performance Optimizations

### Frontend

1. **Code Splitting**
   - Vite automatically splits code
   - Lazy loading for routes (if added)

2. **Asset Optimization**
   - Minification in production
   - Tree-shaking unused code
   - CSS purging (Tailwind)

3. **Caching**
   - Browser caching for static assets
   - Service worker (can be added)

### Backend

1. **Async Operations**
   - All I/O operations use async/await
   - Non-blocking HTTP requests

2. **Connection Pooling**
   - httpx AsyncClient reuses connections
   - Efficient resource usage

3. **Timeout Management**
   - 60s for uploads
   - 120s for generation
   - 30s for status checks

## Scalability Considerations

### Vertical Scaling

```
Single Server
    ↓
Increase CPU/RAM
    ↓
Handle more concurrent requests
```

### Horizontal Scaling

```
Load Balancer
    ↓
┌─────┼─────┐
│     │     │
v1   v2   v3 (Multiple instances)
│     │     │
└─────┼─────┘
    ↓
Shared State (Redis/DB if needed)
```

### Caching Strategy

```
Request → Check Cache → Hit? → Return
                ↓
              Miss?
                ↓
          Process Request
                ↓
          Update Cache
                ↓
             Return
```

## Deployment Architecture

### Development

```
localhost:5173 (Frontend)
      ↓
localhost:8000 (Backend)
      ↓
External APIs
```

### Production

```
CDN (Frontend Static Files)
      ↓
Load Balancer
      ↓
┌─────┼─────┐
│     │     │
API  API  API (Backend instances)
│     │     │
└─────┼─────┘
      ↓
External APIs
```

## Monitoring Architecture

### Logging Flow

```
Application Event
    ↓
Logger
    ↓
├─ Console (Development)
├─ File (Production)
└─ External Service (Sentry, DataDog)
```

### Health Checks

```
Monitoring Service
    ↓
GET /health (every 30s)
    ↓
Response 200?
    ├─ Yes → Healthy
    └─ No → Alert
```

## Future Architecture Enhancements

1. **Database Layer**
   ```
   Backend → PostgreSQL (User data, history)
           → Redis (Caching, sessions)
           → S3 (File storage)
   ```

2. **Message Queue**
   ```
   Upload → Queue (Celery/RabbitMQ)
          → Worker processes
          → Webhook callback
   ```

3. **Real-time Updates**
   ```
   Backend → WebSocket
           → Push updates to Frontend
           → Live progress
   ```

4. **Microservices**
   ```
   API Gateway
       ↓
   ├─ Upload Service
   ├─ Processing Service
   ├─ Generation Service
   └─ Download Service
   ```

## Conclusion

The architecture is designed to be:
- **Simple**: Easy to understand and maintain
- **Scalable**: Can grow from prototype to production
- **Secure**: API keys protected, CORS configured
- **Performant**: Async operations, optimized builds
- **Flexible**: Easy to extend and customize

This architecture provides a solid foundation for a production-ready application while maintaining simplicity and ease of deployment.

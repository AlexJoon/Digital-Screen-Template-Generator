# Digitally Optimized Upload Generator ("Doug")

A streamlined tool for Columbia Business School staff to create professional digital screen slides. Enter your content directly and generate ready-to-display slides in multiple formats (PowerPoint, PNG, JPG).

## Features

- **Direct Content Entry**: Enter headline, description, caption, and author information directly
- **Three Slide Categories**: Research Spotlight, Student Screens, and Events with category-specific fields
- **Events Support**: Dedicated event slides with date, time, and location fields
- **AI-Powered Face Cropping**: GPT-4o Vision detects faces and automatically centers crops for optimal headshot framing
- **Image Upload**: Upload faculty/speaker images with smart cropping preview and original/cropped toggle
- **QR Code Generation**: Automatically generate QR codes from publication links
- **Multiple Export Formats**: Download as PowerPoint (.pptx), PNG, or JPG with file-type icons
- **Template Selection**: Choose from CBS Blue, Dark, or Light themes
- **Live Preview**: See your slide in real-time as you build it with fullscreen lightbox view
- **Hive Redirect**: Quick link to submit slides to MarComms via Hive form
- **AI Image Analysis**: GPT-4o Vision analyzes uploaded images for context
- **Local Generation**: All slide rendering happens locally for instant exports
- **CBS Brand Styling**: Consistent underline form inputs, cyan accents, and step timeline

## Tech Stack

### Backend (Python 3.9+)
- **FastAPI**: Modern, fast Python web framework
- **Pillow (PIL)**: Image processing and PNG/JPG export
- **python-pptx**: PowerPoint generation
- **NumPy**: Fast gradient rendering
- **qrcode**: QR code generation
- **OpenAI SDK**: GPT-4o Vision for image analysis
- **Pydantic**: Data validation and settings management

### Frontend
- **React 18**: UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **qrcode.react**: QR code preview in browser

## Project Structure

```
digitally-optimized-upload-generator/
├── backend/
│   ├── services/
│   │   ├── openai_service.py      # OpenAI GPT-4o Vision integration
│   │   ├── image_utils.py         # AI face-centered cropping
│   │   ├── exporters/             # Slide generation
│   │   │   ├── base.py            # Base classes and templates
│   │   │   ├── export_service.py  # Export orchestration
│   │   │   ├── image_exporter.py  # PNG/JPG export (Pillow)
│   │   │   └── pptx_exporter.py   # PowerPoint export
│   ├── config.py                  # Configuration management
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   ├── Procfile                   # Railway deployment
│   ├── railway.toml               # Railway configuration
│   └── .env.example               # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadForm.jsx     # Main form component
│   │   │   ├── FormInput.jsx      # Reusable form input
│   │   │   ├── FileUploadInput.jsx # Image upload component
│   │   │   ├── SlidePreview.jsx   # Live slide preview
│   │   │   └── StatusDisplay.jsx  # Status and progress
│   │   ├── App.jsx                # Main application
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── public/
│   │   └── cbs-logo.png           # CBS Hermes logo
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── railway.toml               # Railway configuration
│   └── .env.example               # Environment template
│
├── ARCHITECTURE.md                # Detailed architecture documentation
├── DEPLOYMENT.md                  # Railway deployment guide
└── README.md                      # This file
```

## Quick Start

### Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
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

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Quick Start Script

For convenience, run both servers at once:
```bash
./start.sh
```

## Usage

### Creating a Slide

1. **Select Category**: Choose your slide type:
   - **Research Spotlight**: For faculty research highlights (requires image)
   - **Student Screens**: For student-related content (requires image)
   - **Events**: For event announcements with date, time, and location
2. **Enter Content**:
   - **Headline**: Main title for the slide
   - **Caption** (optional): Small text above the headline
   - **Description**: Body text for the slide
   - **Author Name** (optional): Name to highlight in accent color
   - **Publication Link** (optional): URL for QR code generation
   - **Event Fields** (Events category only): Date, Time, Location
3. **Upload Image**: Faculty photo or relevant image (optional for Events)
4. **Review**: Check the AI-generated summary
5. **Select Template**: Choose CBS Blue, Dark, or Light theme
6. **Export**: Download as PowerPoint, PNG, or JPG
7. **Submit to Hive** (optional): Opens Hive form to submit to MarComms

### API Endpoints

#### POST `/analyze-and-crop-image`
Analyze image with GPT-4o Vision for face detection and return an optimally cropped version.

**Parameters (multipart/form-data):**
- `image`: Image file (required)

**Query:**
- `output_size`: Output image size in pixels (default: 800)

**Response:**
- `success`: Boolean indicating success
- `has_face`: Whether a face was detected
- `cropped_image_base64`: Base64-encoded cropped JPEG
- `crop_info`: Details about the crop operation

#### POST `/process-metadata`
Submit slide content and get a summary.

**Parameters (multipart/form-data):**
- `slide_category`: Type of slide
- `headline`: Main title (required)
- `description`: Body text (required)
- `caption`: Small caption text
- `author_name`: Author to highlight
- `publication_link`: URL for QR code
- `image`: Image file (JPEG, PNG, GIF, WebP)
- `event_date`: Event date (for Events category)
- `event_time`: Event time (for Events category)
- `event_location`: Event location (for Events category)

#### POST `/export`
Generate and download a slide.

**Query:** `?format=pptx|png|jpg`

**Body (JSON):**
```json
{
  "headline": "Your Headline",
  "description": "Your description text",
  "template_id": "template1",
  "session_id": "uuid-from-upload",
  "event_date": "February 24, 2025",
  "event_time": "6:00 PM",
  "event_location": "Cooperman Commons"
}
```

#### GET `/health`
Health check endpoint.

## Templates

Three CBS-branded templates are available:

| Template | Background | Text | Accent |
|----------|------------|------|--------|
| CBS Blue (default) | Blue gradient | White | Cyan |
| Dark | Dark gray gradient | White | Cyan |
| Light | Light gray gradient | Dark | Blue |

## Deployment

The application is configured for Railway deployment. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

1. Push to GitHub
2. Connect repository to Railway
3. Create two services (backend and frontend)
4. Set environment variables
5. Deploy

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed system architecture
- [DEPLOYMENT.md](DEPLOYMENT.md) - Railway deployment guide

## Development

### Building for Production

**Backend:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
npm run build
```

## Support

For questions or issues, contact [communications@gsb.columbia.edu](mailto:communications@gsb.columbia.edu)

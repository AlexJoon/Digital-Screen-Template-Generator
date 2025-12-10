from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional
from enum import Enum
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

logger.info("Starting application import...")

from config import settings
logger.info(f"Config loaded. CORS origins: {settings.cors_origins_list}")

from services.openai_service import openai_service
logger.info("OpenAI service loaded")

from services.exporters import ExportService, ExportFormat, SlideData
logger.info("Export service loaded")

from services.image_utils import crop_image_to_face
logger.info("Image utils loaded")

import base64


class IframeMiddleware(BaseHTTPMiddleware):
    """Middleware to allow iframe embedding from allowed origins."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Allow iframe embedding - remove restrictive X-Frame-Options
        # Set frame-ancestors to allow specific origins or * for any
        if settings.allowed_iframe_origins:
            origins = settings.allowed_iframe_origins
            response.headers["Content-Security-Policy"] = f"frame-ancestors {origins}"
        else:
            # Default: allow all origins to embed
            response.headers["Content-Security-Policy"] = "frame-ancestors *"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("=" * 50)
    logger.info("APPLICATION STARTUP")
    logger.info(f"CORS origins configured: {settings.cors_origins_list}")
    logger.info(f"OpenAI API key present: {bool(settings.openai_api_key)}")
    logger.info("=" * 50)
    yield
    # Shutdown
    logger.info("APPLICATION SHUTDOWN")


app = FastAPI(
    title="Digitally Optimized Upload Generator",
    description="Generate branded digital screen slides in multiple formats",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add iframe embedding support
app.add_middleware(IframeMiddleware)

# Initialize export service
export_service = ExportService()


class ExportFormatEnum(str, Enum):
    pptx = "pptx"
    png = "png"
    jpg = "jpg"


class ProcessMetadataResponse(BaseModel):
    status: str
    metadata_summary: str
    metadata: dict


class ExportResponse(BaseModel):
    status: str
    message: str
    format: str
    filename: str


@app.get("/")
async def root():
    return {
        "message": "CBS Digital Screen Generator API",
        "version": "2.0.0",
        "supported_formats": ["pptx", "png", "jpg"],
        "endpoints": {
            "/process-metadata": "POST - Process slide metadata and analyze image",
            "/export": "POST - Export slide to specified format",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {
        "status": "healthy",
        "supported_formats": [f.value for f in export_service.supported_formats]
    }


# ============================================================
# AI Image Processing Endpoints
# ============================================================

class CropImageResponse(BaseModel):
    """Response from image crop endpoint"""
    success: bool
    has_face: bool
    cropped_image_base64: Optional[str] = None
    crop_info: Optional[dict] = None
    error: Optional[str] = None


@app.post("/analyze-and-crop-image", response_model=CropImageResponse)
async def analyze_and_crop_image(
    image: UploadFile = File(...),
    output_size: int = Query(default=800, description="Output image size in pixels")
):
    """
    Analyze an uploaded image using GPT-4 Vision to detect face position,
    then crop the image centered on the detected face.

    Returns the cropped image as base64 for preview and later use.

    If no face is detected, returns a center-cropped square image.
    """
    try:
        image_data = await image.read()
        image_type = image.content_type or "image/jpeg"

        # Step 1: Use GPT-4 Vision to detect face position
        print(f"Detecting face in uploaded image: {image.filename}")
        face_detection = await openai_service.detect_face_position(
            image_data,
            image_type
        )
        print(f"Face detection result: {face_detection}")

        # Step 2: Crop image based on face detection
        cropped_image, crop_info = crop_image_to_face(
            image_data,
            face_detection,
            output_size=output_size
        )

        # Convert to base64 for frontend
        cropped_base64 = base64.b64encode(cropped_image).decode('utf-8')

        return CropImageResponse(
            success=True,
            has_face=face_detection.get("has_face", False),
            cropped_image_base64=cropped_base64,
            crop_info={
                **crop_info,
                "face_detection": face_detection
            }
        )

    except Exception as e:
        print(f"Error in analyze_and_crop_image: {str(e)}")
        return CropImageResponse(
            success=False,
            has_face=False,
            error=str(e)
        )


# Store for processed metadata (in production, use Redis or similar)
_metadata_store: dict = {}


@app.post("/process-metadata", response_model=ProcessMetadataResponse)
async def process_metadata(
    image: UploadFile = File(None),
    slide_category: Optional[str] = Form(None),
    headline: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    publication_link: Optional[str] = Form(None),
    event_date: Optional[str] = Form(None),
    event_time: Optional[str] = Form(None),
    event_location: Optional[str] = Form(None)
):
    """
    Process metadata fields and analyze the uploaded image.
    Returns formatted metadata summary for user review.
    """
    try:
        # Analyze image with GPT-4 Vision
        image_description = None
        image_data = None
        if image:
            print(f"Analyzing uploaded image: {image.filename}")
            image_data = await image.read()
            image_description = await openai_service.analyze_image(
                image_data,
                image.content_type or "image/jpeg"
            )
            print(f"Image analysis complete: {image_description}")

        # Format metadata summary
        metadata_summary = openai_service.format_metadata_summary(
            slide_category=slide_category,
            headline=headline,
            caption=caption,
            description=description,
            author_name=author_name,
            publication_link=publication_link,
            image_description=image_description,
            event_date=event_date,
            event_time=event_time,
            event_location=event_location
        )

        # Store image data for later export (keyed by some identifier)
        # In production, use proper session/cache management
        import hashlib
        session_id = hashlib.md5(f"{headline}{description}".encode()).hexdigest()[:16]
        _metadata_store[session_id] = {
            "image_data": image_data,
            "image_description": image_description
        }

        return ProcessMetadataResponse(
            status="success",
            metadata_summary=metadata_summary,
            metadata={
                "slide_category": slide_category,
                "headline": headline,
                "caption": caption,
                "description": description,
                "author_name": author_name,
                "publication_link": publication_link,
                "image_description": image_description,
                "session_id": session_id,
                "event_date": event_date,
                "event_time": event_time,
                "event_location": event_location
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing metadata: {str(e)}"
        )


class ExportRequest(BaseModel):
    headline: str
    description: str
    caption: Optional[str] = None
    author_name: Optional[str] = None
    publication_link: Optional[str] = None
    image_description: Optional[str] = None
    template_id: str = "template1"
    session_id: Optional[str] = None
    # Event-specific fields
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    event_location: Optional[str] = None


@app.post("/export")
async def export_slide(
    request: ExportRequest,
    format: ExportFormatEnum = Query(default=ExportFormatEnum.pptx, description="Export format")
):
    """
    Export slide to the specified format (pptx, png, or jpg).
    Returns the file directly for download.
    """
    try:
        # Get image data from store if available
        image_data = None
        if request.session_id and request.session_id in _metadata_store:
            image_data = _metadata_store[request.session_id].get("image_data")

        # Create slide data
        slide_data = SlideData(
            headline=request.headline,
            description=request.description,
            caption=request.caption,
            author_name=request.author_name,
            publication_link=request.publication_link,
            image_data=image_data,
            image_description=request.image_description,
            template_id=request.template_id,
            event_date=request.event_date,
            event_time=request.event_time,
            event_location=request.event_location
        )

        # Get the export format enum
        export_format = ExportFormat(format.value)

        # Export
        content = await export_service.export(slide_data, export_format)
        content_type = export_service.get_content_type(export_format)
        extension = export_service.get_file_extension(export_format)

        # Generate filename
        safe_headline = "".join(c for c in request.headline[:30] if c.isalnum() or c in " -_").strip()
        filename = f"slide_{safe_headline}{extension}"

        return Response(
            content=content,
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting slide: {str(e)}"
        )


@app.post("/export-with-image")
async def export_slide_with_image(
    image: UploadFile = File(...),
    headline: str = Form(...),
    description: str = Form(...),
    caption: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    publication_link: Optional[str] = Form(None),
    template_id: str = Form("template1"),
    format: ExportFormatEnum = Query(default=ExportFormatEnum.pptx)
):
    """
    Export slide with image upload in a single request.
    Useful for direct exports without the two-step process.
    """
    try:
        # Read image
        image_data = await image.read() if image else None

        # Create slide data
        slide_data = SlideData(
            headline=headline,
            description=description,
            caption=caption,
            author_name=author_name,
            publication_link=publication_link,
            image_data=image_data,
            template_id=template_id
        )

        # Get the export format enum
        export_format = ExportFormat(format.value)

        # Export
        content = await export_service.export(slide_data, export_format)
        content_type = export_service.get_content_type(export_format)
        extension = export_service.get_file_extension(export_format)

        # Generate filename
        safe_headline = "".join(c for c in headline[:30] if c.isalnum() or c in " -_").strip()
        filename = f"slide_{safe_headline}{extension}"

        return Response(
            content=content,
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting slide: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from enum import Enum

from config import settings
from services.openai_service import openai_service
from services.exporters import ExportService, ExportFormat, SlideData
from services.hive import hive_service


app = FastAPI(
    title="CBS Digital Screen Generator",
    description="Generate branded digital screen slides in multiple formats",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {
        "status": "healthy",
        "supported_formats": [f.value for f in export_service.supported_formats]
    }


# Store for processed metadata (in production, use Redis or similar)
_metadata_store: dict = {}


@app.post("/process-metadata", response_model=ProcessMetadataResponse)
async def process_metadata(
    image: UploadFile = File(...),
    slide_category: Optional[str] = Form(None),
    headline: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    publication_link: Optional[str] = Form(None)
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
            image_description=image_description
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
                "session_id": session_id
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
            template_id=request.template_id
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


# Legacy endpoint compatibility - redirects to new export
@app.post("/generate-presentation")
async def generate_presentation_legacy(
    request: ExportRequest,
    format: ExportFormatEnum = Query(default=ExportFormatEnum.pptx)
):
    """
    Legacy endpoint for backwards compatibility.
    Redirects to the new /export endpoint.
    """
    return await export_slide(request, format)


# ============================================================
# Hive Integration Endpoints
# ============================================================

class HiveSubmitRequest(BaseModel):
    """Request body for Hive submission"""
    headline: str
    description: str
    caption: Optional[str] = None
    author_name: Optional[str] = None
    publication_link: Optional[str] = None
    image_description: Optional[str] = None
    template_id: str = "template1"
    session_id: Optional[str] = None
    export_format: ExportFormatEnum = ExportFormatEnum.png


class HiveSubmitResponse(BaseModel):
    """Response from Hive submission"""
    success: bool
    action_id: Optional[str] = None
    action_url: Optional[str] = None
    error: Optional[str] = None


@app.post("/submit-to-hive", response_model=HiveSubmitResponse)
async def submit_to_hive(request: HiveSubmitRequest):
    """
    Submit a digital screen slide request to Hive.

    This endpoint:
    1. Exports the slide to the specified format (PNG by default)
    2. Creates a Hive action in Marcomms Service Requests
    3. Attaches the exported slide file to the action

    Returns the Hive action URL for tracking.
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
            template_id=request.template_id
        )

        # Get the export format
        export_format = ExportFormat(request.export_format.value)

        # Submit to Hive
        result = await hive_service.submit_slide_request(
            slide_data=slide_data,
            export_format=export_format
        )

        return HiveSubmitResponse(
            success=result.success,
            action_id=result.action_id,
            action_url=result.action_url,
            error=result.error
        )

    except Exception as e:
        return HiveSubmitResponse(
            success=False,
            error=str(e)
        )


@app.get("/hive/projects")
async def get_hive_projects():
    """
    Get available Hive projects for submission.
    Useful for letting users choose a different project.
    """
    try:
        projects = await hive_service.get_available_projects()
        return {
            "status": "success",
            "projects": projects,
            "default_project_id": settings.hive_default_project_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching Hive projects: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

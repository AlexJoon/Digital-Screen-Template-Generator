"""Export-related routes."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from enum import Enum

from services.exporters import ExportService, ExportFormat, SlideData

router = APIRouter(tags=["exports"])

# Initialize export service
export_service = ExportService()

# Store for processed metadata (in production, use Redis or similar)
_metadata_store: dict = {}


class ExportFormatEnum(str, Enum):
    pptx = "pptx"
    png = "png"
    jpg = "jpg"


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
    # Category field
    slide_category: Optional[str] = "research_spotlight"


def get_metadata_store():
    """Get reference to metadata store."""
    return _metadata_store


def store_metadata(session_id: str, data: dict):
    """Store metadata for later retrieval."""
    _metadata_store[session_id] = data


@router.post("/export")
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
            event_location=request.event_location,
            slide_category=request.slide_category
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


@router.post("/export-with-image")
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


def get_supported_formats():
    """Get list of supported export formats."""
    return [f.value for f in export_service.supported_formats]

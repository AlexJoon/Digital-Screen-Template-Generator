"""Image processing routes."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import base64
import hashlib

from services.openai_service import openai_service
from services.image_utils import crop_image_to_face
from .exports import store_metadata

router = APIRouter(tags=["images"])


class CropImageResponse(BaseModel):
    """Response from image crop endpoint"""
    success: bool
    has_face: bool
    cropped_image_base64: Optional[str] = None
    crop_info: Optional[dict] = None
    error: Optional[str] = None


class ProcessMetadataResponse(BaseModel):
    status: str
    metadata_summary: str
    metadata: dict


@router.post("/analyze-and-crop-image", response_model=CropImageResponse)
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


@router.post("/process-metadata", response_model=ProcessMetadataResponse)
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
        session_id = hashlib.md5(f"{headline}{description}".encode()).hexdigest()[:16]
        store_metadata(session_id, {
            "image_data": image_data,
            "image_description": image_description
        })

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

from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
import httpx

from config import settings
from services import openai_service, slidespeak_service
from utils.text_extraction import extract_text_from_file


app = FastAPI(
    title="SlideSpeak Ingestion Tool",
    description="Upload documents and generate branded PowerPoint presentations",
    version="1.0.0"
)

# Configure CORS for iframe embedding
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PresentationRequest(BaseModel):
    tone: str = "professional"
    verbosity: str = "standard"
    language: str = "en"
    fetch_images: bool = True
    custom_instructions: Optional[str] = None


class PresentationResponse(BaseModel):
    status: str
    message: str
    task_id: Optional[str] = None
    download_url: Optional[str] = None


@app.get("/")
async def root():
    return {
        "message": "SlideSpeak Ingestion Tool API",
        "version": "1.0.0",
        "endpoints": {
            "/upload-and-generate": "POST - Upload document and generate presentation",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/synthesize-content")
async def synthesize_content(file: UploadFile = File(...)):
    """
    Step 1: Upload file and synthesize content with OpenAI.
    Returns the synthesized text for user review.
    """
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-powerpoint"
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Please upload PDF, Word, or text files."
            )

        # Read file content
        file_content = await file.read()

        # Extract text from uploaded file
        print(f"Processing file: {file.filename} (type: {file.content_type})")
        try:
            document_text = extract_text_from_file(file_content, file.content_type, file.filename)
            print(f"Successfully extracted {len(document_text)} characters from {file.filename}")
        except Exception as e:
            print(f"Error extracting text: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Could not extract text from file: {str(e)}"
            )

        # Synthesize text with OpenAI for digital screen optimization
        print("Optimizing content with AI for digital screens...")
        synthesized_text = await openai_service.synthesize_text(document_text)
        print("Content optimization complete")

        return {
            "status": "success",
            "synthesized_text": synthesized_text
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )


class GeneratePresentationRequest(BaseModel):
    plain_text: str


@app.post("/generate-presentation", response_model=PresentationResponse)
async def generate_presentation(
    request: GeneratePresentationRequest,
    tone: str = "professional",
    verbosity: str = "standard",
    language: str = "en",
    fetch_images: bool = True,
    custom_instructions: Optional[str] = None
):
    """
    Step 2: Generate presentation from synthesized text.
    """
    try:
        print("Generating branded presentation...")
        presentation_result = await slidespeak_service.generate_presentation(
            plain_text=request.plain_text,
            document_uuids=None,  # Don't use document upload, just plain text
            length=1,  # Single slide for digital screen
            tone=tone,
            verbosity=verbosity,
            language=language,
            fetch_images=fetch_images,
            use_branding_logo=True,
            use_branding_fonts=True,
            synchronous=True,  # Wait for completion
            response_format="powerpoint",
            custom_user_instructions=custom_instructions
        )

        # Extract download URL from response
        download_url = presentation_result.get("download_url")

        if not download_url:
            # Handle async case
            task_id = presentation_result.get("task_id")
            return PresentationResponse(
                status="processing",
                message="Presentation is being generated. Use task_id to check status.",
                task_id=task_id
            )

        return PresentationResponse(
            status="success",
            message="Presentation generated successfully",
            download_url=download_url
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"SlideSpeak API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating presentation: {str(e)}"
        )


@app.post("/upload-and-generate", response_model=PresentationResponse)
async def upload_and_generate(
    file: UploadFile = File(...),
    tone: str = "professional",
    verbosity: str = "standard",
    language: str = "en",
    fetch_images: bool = True,
    custom_instructions: Optional[str] = None
):
    """
    Upload a document and generate a branded PowerPoint presentation.

    This endpoint:
    1. Uploads the document to SlideSpeak
    2. Extracts and synthesizes text using OpenAI
    3. Generates a 3-slide presentation with branding
    4. Returns the presentation for download
    """
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-powerpoint"
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Please upload PDF, Word, or text files."
            )

        # Read file content
        file_content = await file.read()

        # Step 1: Extract text from uploaded file
        print(f"Processing file: {file.filename} (type: {file.content_type})")
        try:
            document_text = extract_text_from_file(file_content, file.content_type, file.filename)
            print(f"Successfully extracted {len(document_text)} characters from {file.filename}")
        except Exception as e:
            print(f"Error extracting text: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Could not extract text from file: {str(e)}"
            )

        # Step 2: Synthesize text with OpenAI for digital screen optimization
        print("Optimizing content with AI for digital screens...")
        synthesized_text = await openai_service.synthesize_text(document_text)
        print("Content optimization complete")

        # Step 3: Generate presentation with SlideSpeak using plain text only
        print("Generating branded presentation...")
        presentation_result = await slidespeak_service.generate_presentation(
            plain_text=synthesized_text,
            document_uuids=None,  # Don't use document upload, just plain text
            length=3,  # Exactly 3 slides
            tone=tone,
            verbosity=verbosity,
            language=language,
            fetch_images=fetch_images,
            use_branding_logo=True,
            use_branding_fonts=True,
            synchronous=True,  # Wait for completion
            response_format="powerpoint",
            custom_user_instructions=custom_instructions
        )

        # Extract download URL from response
        download_url = presentation_result.get("download_url")

        if not download_url:
            # Handle async case
            task_id = presentation_result.get("task_id")
            return PresentationResponse(
                status="processing",
                message="Presentation is being generated. Use task_id to check status.",
                task_id=task_id
            )

        return PresentationResponse(
            status="success",
            message="Presentation generated successfully",
            download_url=download_url
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"SlideSpeak API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )


@app.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    """
    Check the status of an async presentation generation task.
    """
    try:
        status = await slidespeak_service.get_task_status(task_id)
        return status
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error checking task status: {str(e)}"
        )


@app.get("/download/{url:path}")
async def download_presentation(url: str):
    """
    Proxy endpoint to download presentations through the backend.
    This helps with CORS issues when embedding in iframe.
    """
    try:
        content = await slidespeak_service.download_presentation(url)

        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={
                "Content-Disposition": "attachment; filename=presentation.pptx"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error downloading presentation: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

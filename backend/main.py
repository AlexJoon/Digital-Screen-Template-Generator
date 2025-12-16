"""
Digitally Optimized Upload Generator - Main API entry point.

This file sets up the FastAPI application and includes routers from the routers module.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
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

# Import routers
from routers import templates_router, exports_router, images_router
from routers.exports import get_supported_formats
logger.info("Routers loaded")


class IframeMiddleware(BaseHTTPMiddleware):
    """Middleware to allow iframe embedding from allowed origins."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if settings.allowed_iframe_origins:
            origins = settings.allowed_iframe_origins
            response.headers["Content-Security-Policy"] = f"frame-ancestors {origins}"
        else:
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

# Include routers
app.include_router(templates_router)
app.include_router(exports_router)
app.include_router(images_router)


@app.get("/")
async def root():
    return {
        "message": "CBS Digital Screen Generator API",
        "version": "2.0.0",
        "supported_formats": ["pptx", "png", "jpg"],
        "endpoints": {
            "/process-metadata": "POST - Process slide metadata and analyze image",
            "/export": "POST - Export slide to specified format",
            "/templates/{category}": "GET - Get templates for a category",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {
        "status": "healthy",
        "supported_formats": get_supported_formats()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

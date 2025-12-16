"""Template-related routes."""

from fastapi import APIRouter, HTTPException
from services.exporters import CategoryTemplates

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/{category}")
async def get_category_templates(category: str):
    """
    Get available templates for a specific slide category.

    Returns template options specific to the category (e.g., research_spotlight, media_mention, etc.)
    """
    try:
        category_templates = CategoryTemplates.get_category_templates(category)
        return {
            "category": category,
            "category_display_name": category_templates.category_display_name,
            "templates": [
                {
                    "id": t.id,
                    "name": t.name,
                    "description": t.description,
                    "layout_type": t.layout_type,
                    "background_color": t.background_color,
                    "text_color": t.text_color,
                    "accent_color": t.accent_color,
                    "image_position": t.image_position,
                    "image_size": t.image_size,
                    "text_alignment": t.text_alignment
                }
                for t in category_templates.templates
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

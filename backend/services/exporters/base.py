from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Dict, List


class ExportFormat(str, Enum):
    PPTX = "pptx"
    PNG = "png"
    JPG = "jpg"


class SlideCategory(str, Enum):
    RESEARCH_SPOTLIGHT = "research_spotlight"
    STUDENT_SCREENS = "student_screens"
    EVENTS = "events"
    MEDIA_MENTION = "media_mention"
    CONGRATULATIONS = "congratulations"
    PODCAST = "podcast"
    ANNOUNCEMENT = "announcement"


@dataclass
class TemplateStyle:
    """Individual template style configuration"""
    id: str
    name: str
    description: str
    layout_type: str  # e.g., "full_hero", "split_layout_a", "split_layout_b", etc.
    background_color: str
    background_gradient_end: str
    text_color: str
    accent_color: str
    # Layout-specific options
    image_position: str = "right"  # "right", "left", "full", "top", "circular"
    image_size: str = "medium"  # "small", "medium", "large", "full"
    text_alignment: str = "left"  # "left", "center", "right"


@dataclass
class CategoryTemplates:
    """Templates available for a specific category"""
    category: SlideCategory
    category_display_name: str
    templates: List[TemplateStyle]

    @classmethod
    def get_category_templates(cls, category: str) -> "CategoryTemplates":
        """Get available templates for a category"""
        category_configs = {
            # Research Spotlight - 3 styles
            "research_spotlight": cls(
                category=SlideCategory.RESEARCH_SPOTLIGHT,
                category_display_name="Research Spotlight",
                templates=[
                    TemplateStyle(
                        id="research_full_hero",
                        name="Full Hero Image",
                        description="Large background image with text overlay",
                        layout_type="full_hero",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="full",
                        image_size="full"
                    ),
                    TemplateStyle(
                        id="research_split_a",
                        name="Split Layout A (Text-primary)",
                        description="Text on left, image on right",
                        layout_type="split_text_primary",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="right",
                        image_size="medium"
                    ),
                    TemplateStyle(
                        id="research_split_b",
                        name="Split Layout B (Image-forward)",
                        description="Large image on left, text on right",
                        layout_type="split_image_primary",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="left",
                        image_size="large"
                    ),
                ]
            ),

            # Student Screens - same as research for now
            "student_screens": cls(
                category=SlideCategory.STUDENT_SCREENS,
                category_display_name="Student Screens",
                templates=[
                    TemplateStyle(
                        id="student_split_a",
                        name="Split Layout (Text-primary)",
                        description="Text on left, image on right",
                        layout_type="split_text_primary",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="right",
                        image_size="medium"
                    ),
                    TemplateStyle(
                        id="student_full_hero",
                        name="Full Hero Image",
                        description="Large background image with text overlay",
                        layout_type="full_hero",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="full",
                        image_size="full"
                    ),
                ]
            ),

            # Events - TBD placeholder styles
            "events": cls(
                category=SlideCategory.EVENTS,
                category_display_name="Events",
                templates=[
                    TemplateStyle(
                        id="event_standard",
                        name="Standard Event Layout",
                        description="Clean layout with event details prominently displayed",
                        layout_type="event_standard",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="right",
                        image_size="medium"
                    ),
                    TemplateStyle(
                        id="event_speaker",
                        name="Speaker Highlight",
                        description="Featured speaker with circular image",
                        layout_type="event_speaker",
                        background_color="#1a1a1a",
                        background_gradient_end="#2d2d2d",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="circular",
                        image_size="medium"
                    ),
                ]
            ),

            # Media Mention - 3 styles
            "media_mention": cls(
                category=SlideCategory.MEDIA_MENTION,
                category_display_name="Media Mention",
                templates=[
                    TemplateStyle(
                        id="media_vertical",
                        name="Vertical Article Preview",
                        description="Article preview with vertical image placement",
                        layout_type="media_vertical",
                        background_color="#f8f9fa",
                        background_gradient_end="#e9ecef",
                        text_color="#181a1c",
                        accent_color="#003DA5",
                        image_position="top",
                        image_size="medium"
                    ),
                    TemplateStyle(
                        id="media_wide",
                        name="Wide Article Preview",
                        description="Horizontal article preview layout",
                        layout_type="media_wide",
                        background_color="#FFFFFF",
                        background_gradient_end="#f8f9fa",
                        text_color="#181a1c",
                        accent_color="#003DA5",
                        image_position="left",
                        image_size="large"
                    ),
                    TemplateStyle(
                        id="media_image_feature",
                        name="Image Feature",
                        description="Large featured image with overlay text",
                        layout_type="media_image_feature",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="full",
                        image_size="full"
                    ),
                ]
            ),

            # Congratulations - 2 styles
            "congratulations": cls(
                category=SlideCategory.CONGRATULATIONS,
                category_display_name="Congratulations",
                templates=[
                    TemplateStyle(
                        id="congrats_split_light",
                        name="Split Layout - Light",
                        description="Light background with split layout",
                        layout_type="congrats_split",
                        background_color="#f8f9fa",
                        background_gradient_end="#e9ecef",
                        text_color="#181a1c",
                        accent_color="#003DA5",
                        image_position="right",
                        image_size="medium"
                    ),
                    TemplateStyle(
                        id="congrats_framed",
                        name="Framed Image",
                        description="Centered framed image with decorative border",
                        layout_type="congrats_framed",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="center",
                        image_size="medium"
                    ),
                ]
            ),

            # Podcast - TBD placeholder styles
            "podcast": cls(
                category=SlideCategory.PODCAST,
                category_display_name="Podcast",
                templates=[
                    TemplateStyle(
                        id="podcast_standard",
                        name="Podcast Standard",
                        description="Clean podcast episode layout",
                        layout_type="podcast_standard",
                        background_color="#1a1a1a",
                        background_gradient_end="#2d2d2d",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="left",
                        image_size="medium"
                    ),
                    TemplateStyle(
                        id="podcast_feature",
                        name="Podcast Feature",
                        description="Featured episode with large artwork",
                        layout_type="podcast_feature",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="left",
                        image_size="large"
                    ),
                ]
            ),

            # Announcement - TBD placeholder styles
            "announcement": cls(
                category=SlideCategory.ANNOUNCEMENT,
                category_display_name="Announcement",
                templates=[
                    TemplateStyle(
                        id="announcement_standard",
                        name="Standard Announcement",
                        description="Clean institutional announcement layout",
                        layout_type="announcement_standard",
                        background_color="#003DA5",
                        background_gradient_end="#0052CC",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="right",
                        image_size="small"
                    ),
                    TemplateStyle(
                        id="announcement_bold",
                        name="Bold Announcement",
                        description="High-impact announcement with large text",
                        layout_type="announcement_bold",
                        background_color="#181a1c",
                        background_gradient_end="#2d2d2d",
                        text_color="#FFFFFF",
                        accent_color="#009bdb",
                        image_position="none",
                        image_size="none",
                        text_alignment="center"
                    ),
                ]
            ),
        }

        return category_configs.get(category, category_configs["research_spotlight"])


@dataclass
class TemplateConfig:
    """Template styling configuration - for backward compatibility"""
    name: str
    background_color: str
    background_gradient_end: str
    text_color: str
    accent_color: str

    @classmethod
    def get_template(cls, template_id: str) -> "TemplateConfig":
        """Legacy method - maps old template IDs to new system"""
        templates = {
            "template1": cls(
                name="CBS Blue",
                background_color="#003DA5",
                background_gradient_end="#0052CC",
                text_color="#FFFFFF",
                accent_color="#009bdb"
            ),
            "template2": cls(
                name="Dark Theme",
                background_color="#1a1a1a",
                background_gradient_end="#2d2d2d",
                text_color="#FFFFFF",
                accent_color="#009bdb"
            ),
            "template3": cls(
                name="Light Theme",
                background_color="#f8f9fa",
                background_gradient_end="#e9ecef",
                text_color="#181a1c",
                accent_color="#003DA5"
            ),
        }
        return templates.get(template_id, templates["template1"])

    @classmethod
    def from_template_style(cls, style: TemplateStyle) -> "TemplateConfig":
        """Create TemplateConfig from a TemplateStyle"""
        return cls(
            name=style.name,
            background_color=style.background_color,
            background_gradient_end=style.background_gradient_end,
            text_color=style.text_color,
            accent_color=style.accent_color
        )


@dataclass
class SlideData:
    """Data for slide generation"""
    headline: str
    description: str
    caption: Optional[str] = None
    author_name: Optional[str] = None
    publication_link: Optional[str] = None
    image_data: Optional[bytes] = None
    image_description: Optional[str] = None
    template_id: str = "template1"
    # Event-specific fields
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    event_location: Optional[str] = None
    # Category field
    slide_category: Optional[str] = "research_spotlight"

    @property
    def template(self) -> TemplateConfig:
        return TemplateConfig.get_template(self.template_id)

    @property
    def template_style(self) -> Optional[TemplateStyle]:
        """Get the TemplateStyle for this slide's template_id and category"""
        if self.slide_category:
            category_templates = CategoryTemplates.get_category_templates(self.slide_category)
            for style in category_templates.templates:
                if style.id == self.template_id:
                    return style
        return None


class BaseExporter(ABC):
    """Abstract base class for all exporters"""

    @property
    @abstractmethod
    def format(self) -> ExportFormat:
        """Return the export format this exporter handles"""
        pass

    @property
    @abstractmethod
    def content_type(self) -> str:
        """Return the MIME content type for this format"""
        pass

    @property
    @abstractmethod
    def file_extension(self) -> str:
        """Return the file extension for this format"""
        pass

    @abstractmethod
    async def export(self, slide_data: SlideData) -> bytes:
        """
        Export the slide data to the specific format.

        Args:
            slide_data: The slide content and configuration

        Returns:
            Binary content of the exported file
        """
        pass

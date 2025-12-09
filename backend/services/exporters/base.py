from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class ExportFormat(str, Enum):
    PPTX = "pptx"
    PNG = "png"
    JPG = "jpg"


@dataclass
class TemplateConfig:
    """Template styling configuration"""
    name: str
    background_color: str
    background_gradient_end: str
    text_color: str
    accent_color: str

    @classmethod
    def get_template(cls, template_id: str) -> "TemplateConfig":
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

    @property
    def template(self) -> TemplateConfig:
        return TemplateConfig.get_template(self.template_id)


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

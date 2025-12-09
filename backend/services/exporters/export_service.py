from typing import Dict, Type

from .base import BaseExporter, ExportFormat, SlideData
from .pptx_exporter import PPTXExporter
from .image_exporter import PNGExporter, JPGExporter


class ExportService:
    """
    Facade for all export operations.
    Provides a unified interface for exporting slides to various formats.
    """

    def __init__(self):
        self._exporters: Dict[ExportFormat, BaseExporter] = {}
        self._register_exporters()

    def _register_exporters(self):
        """Register all available exporters"""
        self._register(PPTXExporter())
        self._register(PNGExporter())
        self._register(JPGExporter())

    def _register(self, exporter: BaseExporter):
        """Register an exporter"""
        self._exporters[exporter.format] = exporter

    def get_exporter(self, format: ExportFormat) -> BaseExporter:
        """Get exporter for a specific format"""
        if format not in self._exporters:
            raise ValueError(f"Unsupported export format: {format}")
        return self._exporters[format]

    @property
    def supported_formats(self) -> list[ExportFormat]:
        """List all supported export formats"""
        return list(self._exporters.keys())

    async def export(self, slide_data: SlideData, format: ExportFormat) -> bytes:
        """
        Export slide to the specified format.

        Args:
            slide_data: The slide content and configuration
            format: The desired export format

        Returns:
            Binary content of the exported file
        """
        exporter = self.get_exporter(format)
        return await exporter.export(slide_data)

    def get_content_type(self, format: ExportFormat) -> str:
        """Get MIME content type for a format"""
        return self.get_exporter(format).content_type

    def get_file_extension(self, format: ExportFormat) -> str:
        """Get file extension for a format"""
        return self.get_exporter(format).file_extension


# Singleton instance
export_service = ExportService()

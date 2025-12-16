import base64
import json
import asyncio
from typing import Optional

from playwright.async_api import async_playwright, Browser, Page

from .base import BaseExporter, ExportFormat, SlideData


class BrowserExporter(BaseExporter):
    """
    Export slides by rendering them in a headless browser and taking screenshots.
    This ensures pixel-perfect match with the frontend preview.
    """

    RENDER_URL = "http://localhost:5173/render"
    VIEWPORT_WIDTH = 1920
    VIEWPORT_HEIGHT = 1080

    def __init__(self, format: ExportFormat = ExportFormat.PNG):
        self._format = format
        self._browser: Optional[Browser] = None
        self._playwright = None

    @property
    def format(self) -> ExportFormat:
        return self._format

    @property
    def content_type(self) -> str:
        if self._format == ExportFormat.PNG:
            return "image/png"
        return "image/jpeg"

    @property
    def file_extension(self) -> str:
        if self._format == ExportFormat.PNG:
            return ".png"
        return ".jpg"

    async def _ensure_browser(self):
        """Ensure browser is launched"""
        if self._browser is None:
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )

    async def _prepare_slide_data(self, slide_data: SlideData) -> dict:
        """Convert SlideData to JSON-serializable dict for frontend"""
        data = {
            'headline': slide_data.headline,
            'description': slide_data.description,
            'caption': slide_data.caption,
            'authorName': slide_data.author_name,
            'publicationLink': slide_data.publication_link,
            'eventDate': slide_data.event_date,
            'eventTime': slide_data.event_time,
            'eventLocation': slide_data.event_location,
        }

        # Add template style info
        template_style = slide_data.template_style
        if template_style:
            data['templateStyle'] = {
                'id': template_style.id,
                'name': template_style.name,
                'layout_type': template_style.layout_type,
                'background_color': template_style.background_color,
                'background_gradient_end': template_style.background_gradient_end,
                'text_color': template_style.text_color,
                'accent_color': template_style.accent_color,
                'image_position': template_style.image_position,
                'image_size': template_style.image_size,
                'text_alignment': template_style.text_alignment,
            }
        else:
            # Fallback to legacy template
            template = slide_data.template
            data['templateStyle'] = {
                'background_color': template.background_color,
                'background_gradient_end': template.background_gradient_end,
                'text_color': template.text_color,
                'accent_color': template.accent_color,
                'layout_type': 'split_text_primary',
                'image_position': 'right',
            }

        # Convert image data to base64
        if slide_data.image_data:
            data['imageData'] = base64.b64encode(slide_data.image_data).decode('utf-8')

        return data

    async def export(self, slide_data: SlideData) -> bytes:
        """
        Export slide by rendering in headless browser and screenshotting.

        Args:
            slide_data: The slide content and configuration

        Returns:
            Binary content of the screenshot (PNG or JPG)
        """
        await self._ensure_browser()

        # Prepare data for frontend
        data = await self._prepare_slide_data(slide_data)

        # Create new page with exact viewport
        page: Page = await self._browser.new_page(
            viewport={'width': self.VIEWPORT_WIDTH, 'height': self.VIEWPORT_HEIGHT}
        )

        try:
            # Navigate to render page (without data in URL)
            await page.goto(self.RENDER_URL, wait_until='networkidle')

            # Wait for the component to be ready to receive data
            await page.wait_for_function('window.__SLIDE_RENDER_READY__ === true', timeout=10000)

            # Inject the slide data via JavaScript
            await page.evaluate(f'window.__setSlideData__({json.dumps(data)})')

            # Wait for the component to signal it's ready (after rendering)
            await page.wait_for_selector('#slide-render-container[data-status="ready"]', timeout=10000)

            # Small additional delay to ensure fonts are loaded
            await asyncio.sleep(0.2)

            # Find the slide container and screenshot it
            container = await page.query_selector('#slide-render-container')

            if container:
                # Screenshot the specific element
                screenshot_bytes = await container.screenshot(
                    type='png' if self._format == ExportFormat.PNG else 'jpeg',
                    quality=95 if self._format == ExportFormat.JPG else None
                )
            else:
                # Fallback to full page screenshot
                screenshot_bytes = await page.screenshot(
                    type='png' if self._format == ExportFormat.PNG else 'jpeg',
                    quality=95 if self._format == ExportFormat.JPG else None,
                    clip={'x': 0, 'y': 0, 'width': self.VIEWPORT_WIDTH, 'height': self.VIEWPORT_HEIGHT}
                )

            return screenshot_bytes

        finally:
            await page.close()

    async def close(self):
        """Close browser instance"""
        if self._browser:
            await self._browser.close()
            self._browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None


class BrowserPNGExporter(BrowserExporter):
    """PNG exporter using browser rendering"""

    def __init__(self):
        super().__init__(format=ExportFormat.PNG)


class BrowserJPGExporter(BrowserExporter):
    """JPG exporter using browser rendering"""

    def __init__(self):
        super().__init__(format=ExportFormat.JPG)

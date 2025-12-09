"""
Hive Service

High-level service for submitting digital screen requests to Hive.
Handles the business logic of creating actions and attaching exported slides.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime

from config import settings
from .hive_client import HiveClient, HiveConfig
from ..exporters import ExportService, ExportFormat, SlideData


@dataclass
class HiveSubmissionResult:
    """Result of submitting a request to Hive"""
    success: bool
    action_id: Optional[str] = None
    action_url: Optional[str] = None
    error: Optional[str] = None


class HiveService:
    """
    High-level service for Hive integration.

    Provides business logic for:
    - Creating digital screen request actions
    - Attaching exported slides to actions
    - Formatting action descriptions from slide metadata
    """

    # Default project for MarComms Service Requests
    DEFAULT_PROJECT_ID = "YzWwuHSKwqri9z8QS"

    def __init__(self):
        self._client: Optional[HiveClient] = None
        self._export_service = ExportService()

    @property
    def client(self) -> HiveClient:
        """Lazy-load Hive client"""
        if self._client is None:
            config = HiveConfig(
                api_key=settings.hive_api_key,
                user_id=settings.hive_user_id,
                workspace_id=settings.hive_workspace_id
            )
            self._client = HiveClient(config)
        return self._client

    def _format_action_title(self, slide_data: SlideData) -> str:
        """Format action title from slide data"""
        headline = slide_data.headline[:50] if len(slide_data.headline) > 50 else slide_data.headline
        return f"Digital Screen Request: {headline}"

    def _format_action_description(self, slide_data: SlideData, export_format: str) -> str:
        """Format action description with all slide metadata"""
        lines = [
            "=== Digital Screen Slide Request ===",
            "",
            f"**Headline:** {slide_data.headline}",
        ]

        if slide_data.caption:
            lines.append(f"**Caption:** {slide_data.caption}")

        lines.append(f"**Description:** {slide_data.description}")

        if slide_data.author_name:
            lines.append(f"**Author:** {slide_data.author_name}")

        if slide_data.publication_link:
            lines.append(f"**Publication Link:** {slide_data.publication_link}")

        if slide_data.image_description:
            lines.append(f"**Image:** {slide_data.image_description}")

        lines.extend([
            "",
            f"**Template:** {slide_data.template.name}",
            f"**Export Format:** {export_format.upper()}",
            f"**Submitted:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "",
            "---",
            "Submitted via Doug (Digital Screen Generator)"
        ])

        return "\n".join(lines)

    def _get_filename(self, slide_data: SlideData, export_format: ExportFormat) -> str:
        """Generate filename for the attachment"""
        safe_headline = "".join(
            c for c in slide_data.headline[:30]
            if c.isalnum() or c in " -_"
        ).strip().replace(" ", "_")
        extension = self._export_service.get_file_extension(export_format)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M")
        return f"slide_{safe_headline}_{timestamp}{extension}"

    async def submit_slide_request(
        self,
        slide_data: SlideData,
        export_format: ExportFormat = ExportFormat.PNG,
        project_id: Optional[str] = None
    ) -> HiveSubmissionResult:
        """
        Submit a digital screen slide request to Hive.

        This method:
        1. Exports the slide to the specified format
        2. Creates a Hive action with the slide metadata
        3. Attaches the exported file to the action

        Args:
            slide_data: The slide content and configuration
            export_format: Format to export (PNG recommended for preview)
            project_id: Optional project ID (defaults to MarComms Service Requests)

        Returns:
            HiveSubmissionResult with action details or error
        """
        try:
            # Use default project if not specified
            target_project = project_id or self.DEFAULT_PROJECT_ID

            # Step 1: Export the slide
            file_content = await self._export_service.export(slide_data, export_format)
            content_type = self._export_service.get_content_type(export_format)
            filename = self._get_filename(slide_data, export_format)

            # Step 2: Create the Hive action
            action_title = self._format_action_title(slide_data)
            action_description = self._format_action_description(slide_data, export_format.value)

            action = await self.client.create_action(
                project_id=target_project,
                title=action_title,
                description=action_description
            )

            action_id = action.get("id")
            if not action_id:
                return HiveSubmissionResult(
                    success=False,
                    error="Failed to create action: No action ID returned"
                )

            # Step 3: Attach the exported file
            await self.client.attach_file(
                action_id=action_id,
                file_content=file_content,
                filename=filename,
                content_type=content_type
            )

            # Build action URL
            action_url = f"https://app.hive.com/workspace/{settings.hive_workspace_id}?action={action_id}"

            return HiveSubmissionResult(
                success=True,
                action_id=action_id,
                action_url=action_url
            )

        except Exception as e:
            return HiveSubmissionResult(
                success=False,
                error=str(e)
            )

    async def get_available_projects(self) -> list:
        """
        Get list of available projects for submission.

        Returns:
            List of projects with id and name
        """
        projects = await self.client.get_projects()
        return [
            {"id": p["id"], "name": p["name"]}
            for p in projects
            if not p.get("archived", False)
        ]

    async def close(self):
        """Clean up resources"""
        if self._client:
            await self._client.close()


# Singleton instance
hive_service = HiveService()

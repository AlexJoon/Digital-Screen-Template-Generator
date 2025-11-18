import httpx
from typing import Optional, Dict, Any
from config import settings


class SlidesSpeakService:
    def __init__(self):
        self.base_url = settings.slidespeak_base_url
        self.api_key = settings.slidespeak_api_key
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }

    async def upload_document(self, file_content: bytes, filename: str) -> Optional[str]:
        """
        Upload a document to SlideSpeak.

        Args:
            file_content: The binary content of the file
            filename: The name of the file

        Returns:
            The document UUID from SlideSpeak, or None if upload failed
        """
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {"file": (filename, file_content)}
            headers = {"x-api-key": self.api_key}

            response = await client.post(
                f"{self.base_url}/document/upload",
                files=files,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            # Log the response for debugging
            print(f"Upload response: {data}")

            document_uuid = data.get("document_uuid") or data.get("id") or data.get("uuid")
            if not document_uuid:
                print(f"Warning: No document UUID in response: {data}")

            return document_uuid

    async def generate_presentation(
        self,
        plain_text: str,
        document_uuids: Optional[list] = None,
        length: int = 3,
        tone: str = "professional",
        verbosity: str = "standard",
        language: str = "en",
        fetch_images: bool = True,
        use_branding_logo: bool = True,
        use_branding_fonts: bool = True,
        synchronous: bool = True,
        response_format: str = "powerpoint",
        custom_user_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a presentation using SlideSpeak API.

        Args:
            plain_text: The content to generate slides about
            document_uuids: Optional list of uploaded document UUIDs
            length: Number of slides (default: 3)
            tone: Tone of the presentation
            verbosity: How verbose the text should be
            language: Language code
            fetch_images: Whether to include stock images
            use_branding_logo: Whether to include brand logo
            use_branding_fonts: Whether to apply brand fonts
            synchronous: Whether to wait for completion
            response_format: Output format (powerpoint or pdf)
            custom_user_instructions: Custom instructions for generation

        Returns:
            Response from SlideSpeak API containing presentation data or task ID
        """
        payload = {
            "plain_text": plain_text,
            "length": length,
            "tone": tone,
            "verbosity": verbosity,
            "language": language,
            "fetch_images": fetch_images,
            "use_branding_logo": use_branding_logo,
            "use_branding_fonts": use_branding_fonts,
            "synchronous": synchronous,
            "response_format": response_format,
            "theme": settings.slidespeak_template_id,  # Custom branded template for campus events
            "include_cover": False,
            "include_table_of_contents": False,
        }

        # Add custom instructions for digital screen optimization
        instructions = """Create a single-slide digital screen template following CBS event slide design standards:

        LAYOUT STRUCTURE:
        - Large, bold headline at the top (white text, 72-96pt font size)
        - Left side: Vertical information stack with event details (date, time, location, address)
        - Right side: QR code in bottom right corner with "Learn More & Register Here" or similar call-to-action above it
        - Bottom left: Institutional branding/logos

        DESIGN REQUIREMENTS:
        - 16:9 widescreen format (1920x1080 or similar)
        - Dark or semi-dark background with high contrast
        - Use CBS blue (#009bdb) as accent color strategically
        - Large, readable sans-serif fonts for distance viewing
        - Minimal text density - only essential information
        - Clean, professional layout with clear visual hierarchy
        - Background can include subtle patterns or relevant imagery (not overpowering)

        INFORMATION HIERARCHY (in order of prominence):
        1. Event Title/Name - Largest text, use accent color (CBS blue #009bdb) on 1-2 key words for emphasis
        2. Event Details Block - Clear, organized stack format:
           - Date (single day or date range like "December 5-7, 2025")
           - Time (if applicable, e.g., "8:45 AM - 2:15 PM")
           - Venue/Location name (e.g., "David Geffen Hall")
           - Full address (if physical event)
        3. Target Audience - Who should attend (e.g., "For staff at CBS Centers & Programs" or "All Students Welcome!")
        4. Value Proposition - Brief description of what attendees will gain (e.g., "Learn about Private Equity and network with alums")
        5. Call-to-Action + QR Code - Bottom right corner, with text like "Learn More & Register Here" above the QR code
        6. Institutional Branding - Bottom left corner (program logos, partner organizations)

        STYLE:
        - Professional and clean
        - High contrast for visibility
        - White or light-colored text on dark backgrounds
        - Consistent alignment and spacing
        - Visual balance between text and graphics
        """
        if custom_user_instructions:
            instructions = f"{instructions}\n\nAdditional requirements: {custom_user_instructions}"
        payload["custom_user_instructions"] = instructions

        # Add document UUIDs if provided
        if document_uuids:
            payload["document_uuids"] = document_uuids
            payload["use_wording_from_document"] = True
            payload["use_document_images"] = True

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/presentation/generate",
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()

    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of an async task.

        Args:
            task_id: The task ID from SlideSpeak

        Returns:
            Task status information
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/task_status/{task_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()

    async def download_presentation(self, download_url: str) -> bytes:
        """
        Download the generated presentation.

        Args:
            download_url: The download URL from SlideSpeak

        Returns:
            The binary content of the presentation file
        """
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(download_url)
            response.raise_for_status()
            return response.content


slidespeak_service = SlidesSpeakService()

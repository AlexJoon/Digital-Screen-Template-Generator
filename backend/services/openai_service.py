from openai import OpenAI
from config import settings
from typing import Optional
import base64


class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    async def synthesize_text(self, document_text: str) -> str:
        """
        Return the document text verbatim with normalized whitespace formatting.
        All words and content are preserved exactly as extracted, with natural
        paragraph breaks for readability.

        Args:
            document_text: Raw text extracted from uploaded document

        Returns:
            The same text with paragraph formatting preserved
        """
        # Clean up excessive whitespace while preserving all words
        import re

        # Replace multiple spaces with single space and normalize line breaks
        text = re.sub(r' +', ' ', document_text)

        # Replace all newlines with spaces first to get one continuous text
        text = text.replace('\n', ' ')

        # Clean up any multiple spaces created
        text = re.sub(r' +', ' ', text)

        # Now intelligently add paragraph breaks based on common section patterns
        # Look for section headers (typically start with capital letters and end with colon or are standalone)
        section_patterns = [
            r'(Event Overview)',
            r'(Event Description)',
            r'(Agenda)',
            r'(Featured Panelists)',
            r'(Who Should Attend)',
            r'(Registration)',
            r'(Parking & Directions)',
            r'(Contact Information)',
            r'(Event Title:)',
            r'(Date:)',
            r'(Time:)',
            r'(Location:)',
            r'(Dress Code:)',
        ]

        # Add double newlines before major sections to create paragraphs
        for pattern in section_patterns:
            text = re.sub(pattern, r'\n\n\1', text)

        # Clean up any triple+ newlines to just double newlines
        text = re.sub(r'\n{3,}', '\n\n', text)

        # Clean up spaces before punctuation
        text = re.sub(r'\s+([,.:;!?])', r'\1', text)

        # Clean up leading/trailing whitespace
        return text.strip()

    async def analyze_image(self, image_data: bytes, image_type: str = "image/jpeg") -> str:
        """
        Analyze an image using GPT-4 Vision to describe what's in the image.

        Args:
            image_data: Binary image data
            image_type: MIME type of the image

        Returns:
            Description of what's in the image
        """
        try:
            # Encode image to base64
            base64_image = base64.b64encode(image_data).decode('utf-8')

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Describe this image in 1-2 sentences, focusing on what it depicts and its relevance to research or academic content."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{image_type};base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=150
            )

            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            return "an uploaded image"

    def format_metadata_summary(
        self,
        slide_category: Optional[str] = None,
        headline: Optional[str] = None,
        caption: Optional[str] = None,
        description: Optional[str] = None,
        author_name: Optional[str] = None,
        publication_link: Optional[str] = None,
        image_description: Optional[str] = None
    ) -> str:
        """
        Format metadata into a human-readable summary.

        Returns:
            Formatted summary string
        """
        parts = []

        # Format slide category nicely
        if slide_category:
            category_display = slide_category.replace('_', ' ').title()
            parts.append(f"The slide category you chose: {category_display}")

        if headline:
            parts.append(f"\n\nYour digital screen headline is: \"{headline}\"")

        if caption:
            parts.append(f" with a caption of \"{caption}\"")

        if description:
            parts.append(f"\n\nThe description reads as: \"{description.strip()}\"")

        if author_name:
            parts.append(f"\n\nThe author/researcher to spotlight will be: {author_name}")

        if image_description:
            parts.append(f"\n\nYou have selected an image that shows: {image_description}")

        if publication_link:
            parts.append(f"\n\nThe provided publication link ({publication_link}) will be converted into a QR code within the slide below.")

        if not parts:
            return "No metadata provided."

        return "".join(parts)


openai_service = OpenAIService()

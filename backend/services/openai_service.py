from openai import AsyncOpenAI
from config import settings
from typing import Optional, Dict, Any
import base64
import json
import re


class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

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

            response = await self.client.chat.completions.create(
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

    async def detect_face_position(self, image_data: bytes, image_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Analyze an image using GPT-4 Vision to detect face position for smart cropping.

        Args:
            image_data: Binary image data
            image_type: MIME type of the image

        Returns:
            Dictionary with face detection results:
            {
                'has_face': bool,
                'face_center_x': float (0-1, percentage from left),
                'face_center_y': float (0-1, percentage from top),
                'face_size': float (0-1, relative to image size)
            }
        """
        try:
            base64_image = base64.b64encode(image_data).decode('utf-8')

            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Analyze this image for face detection and positioning.

If there is a human face visible in the image, return a JSON object with:
- "has_face": true
- "face_center_x": a number between 0 and 1 representing the horizontal center of the face (0 = left edge, 1 = right edge)
- "face_center_y": a number between 0 and 1 representing the vertical center of the face (0 = top edge, 1 = bottom edge)
- "face_size": a number between 0 and 1 representing how much of the image the face occupies (0.1 = small, 0.5 = half the image)

If there is NO human face visible, return:
{"has_face": false}

Return ONLY the JSON object, no other text."""
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

            response_text = response.choices[0].message.content.strip()

            # Parse JSON from response (handle markdown code blocks)
            json_match = re.search(r'\{[^}]+\}', response_text)
            if json_match:
                result = json.loads(json_match.group())
                return result

            return {"has_face": False}

        except json.JSONDecodeError as e:
            print(f"Error parsing face detection response: {str(e)}")
            return {"has_face": False}
        except Exception as e:
            print(f"Error detecting face position: {str(e)}")
            return {"has_face": False}

    def format_metadata_summary(
        self,
        slide_category: Optional[str] = None,
        headline: Optional[str] = None,
        caption: Optional[str] = None,
        description: Optional[str] = None,
        author_name: Optional[str] = None,
        publication_link: Optional[str] = None,
        image_description: Optional[str] = None,
        event_date: Optional[str] = None,
        event_time: Optional[str] = None,
        event_location: Optional[str] = None
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

        # Event-specific fields - conversational format
        if event_date or event_time or event_location:
            if event_date and event_time and event_location:
                parts.append(f"\n\nThis event is scheduled for {event_date} at {event_time}, and will take place at {event_location}.")
            elif event_date and event_time:
                parts.append(f"\n\nThis event is scheduled for {event_date} at {event_time}.")
            elif event_date and event_location:
                parts.append(f"\n\nThis event is scheduled for {event_date} at {event_location}.")
            elif event_time and event_location:
                parts.append(f"\n\nThis event will take place at {event_time} at {event_location}.")
            elif event_date:
                parts.append(f"\n\nThis event is scheduled for {event_date}.")
            elif event_time:
                parts.append(f"\n\nThis event is scheduled at {event_time}.")
            elif event_location:
                parts.append(f"\n\nThis event will take place at {event_location}.")

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

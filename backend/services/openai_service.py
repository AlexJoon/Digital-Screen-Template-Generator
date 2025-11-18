from openai import OpenAI
from config import settings


class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)

    async def synthesize_text(self, document_text: str) -> str:
        """
        Synthesize and enhance document text using OpenAI agents.
        This prepares the content for slide generation.

        Args:
            document_text: Raw text extracted from uploaded document

        Returns:
            Synthesized text optimized for presentation slides
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert at creating event content for campus digital screens.
                        Your task is to transform event information into clear, concise content for a SINGLE digital screen slide.

                        Extract and organize the following information:
                        1. Event Title/Name (compelling and clear)
                        2. Date (single day or date range)
                        3. Time (if applicable)
                        4. Location/Venue name
                        5. Full address (if physical event)
                        6. Target audience (who should attend)
                        7. Brief value proposition (what attendees will gain - 1-2 sentences max)

                        Format requirements:
                        - Keep it concise - this is ONE slide only
                        - Use short, punchy sentences (max 10-15 words)
                        - Emphasize key information clearly
                        - Professional yet engaging tone for university staff and students
                        - Ensure text is scannable from a distance

                        Output the information in a structured format that can be easily used to create a single, impactful digital screen slide.
                        Remember: Viewers may only have a few seconds to capture the information."""
                    },
                    {
                        "role": "user",
                        "content": f"Transform this event information into single-slide digital screen content:\n\n{document_text}"
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )

            return response.choices[0].message.content
        except Exception as e:
            # Fallback if OpenAI fails or key is placeholder
            print(f"OpenAI synthesis failed: {e}")
            return document_text


openai_service = OpenAIService()

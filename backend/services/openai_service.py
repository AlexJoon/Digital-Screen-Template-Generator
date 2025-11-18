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
                        Your task is to transform event information into clear, eye-catching content
                        optimized for digital display screens across campus. Focus on:

                        1. EVENT TITLE & HOOK (Slide 1): Grab attention with compelling event name and key benefit
                        2. ESSENTIAL DETAILS (Slide 2): Date, time, location, registration info - large and readable
                        3. HIGHLIGHTS & CALL TO ACTION (Slide 3): Key features, what to expect, how to join

                        Format requirements:
                        - Use short, punchy sentences (max 10-15 words)
                        - Emphasize key information (dates, times, locations)
                        - Create urgency or excitement where appropriate
                        - Ensure text is scannable from a distance
                        - Professional yet engaging tone for university staff and students

                        Remember: This will be displayed on digital screens in campus buildings,
                        so viewers may only have a few seconds to capture the information."""
                    },
                    {
                        "role": "user",
                        "content": f"Transform this event information into 3-slide digital screen content:\n\n{document_text}"
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

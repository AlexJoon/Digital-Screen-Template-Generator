import httpx
import asyncio
from config import settings

async def test_slidespeak_api():
    """Test the SlideSpeak API to see what it returns"""

    base_url = settings.slidespeak_base_url
    api_key = settings.slidespeak_api_key

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }

    payload = {
        "plain_text": "Test Event\n\nDate: December 15, 2025\nTime: 2:00 PM\nLocation: Test Hall\nAddress: 123 Test Street, New York, NY\n\nThis is a test event for digital screens.",
        "length": 1,
        "tone": "professional",
        "verbosity": "standard",
        "language": "en",
        "fetch_images": True,
        "use_branding_logo": True,
        "use_branding_fonts": True,
        "run_sync": True,
        "response_format": "powerpoint",
        "theme": settings.slidespeak_template_id,
        "include_cover": False,
        "include_table_of_contents": False,
        "custom_user_instructions": "Create a single digital screen slide for this event."
    }

    print("Making API call to SlideSpeak...")
    print(f"URL: {base_url}/presentation/generate")
    print(f"Payload: {payload}")
    print("\n" + "="*80 + "\n")

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{base_url}/presentation/generate",
                json=payload,
                headers=headers
            )

            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print("\n" + "="*80 + "\n")
            print(f"Response Body:")
            print(response.text)
            print("\n" + "="*80 + "\n")

            if response.status_code == 200:
                data = response.json()
                print(f"Parsed JSON:")
                for key, value in data.items():
                    print(f"  {key}: {value}")
            else:
                print(f"Error response: {response.text}")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_slidespeak_api())

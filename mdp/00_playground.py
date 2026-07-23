import asyncio
import os
from google import genai

from dotenv import load_dotenv

load_dotenv()  # Automatically finds .env file
# api_key = os.getenv('GEMINI_API_KEY')


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def test_live():
    try:
        async with client.aio.live.connect(
            model="gemini-3.1-flash-live-preview",
            config={"response_modalities": ["TEXT"]},
        ) as session:
            print("Successfully connected!")
            await session.send_realtime_input(text="Hello!")
            async for response in session.receive():
                if response.server_content:
                    print("Received response from model.")
                    break
    except Exception as e:
        print(f"Connection failed: {e}")


asyncio.run(test_live())
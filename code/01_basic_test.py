from dotenv import load_dotenv
import os

load_dotenv()  # Automatically finds .env file
api_key = os.getenv('GEMINI_API_KEY')

from google import genai


client = genai.Client(api_key=api_key)
# client = genai.Client()


input = "Just testing."

interaction = client.interactions.create(
    model="gemini-3.5-flash-lite",
    input=input)
print(interaction.output_text)


from dotenv import load_dotenv
import os

load_dotenv()  # Automatically finds .env file
api_key = os.getenv('GEMINI_API_KEY')


from google import genai
from google.genai import types

# Initialize the Gemini Client (picks up GEMINI_API_KEY from environment)
client = genai.Client()

# Define the user prompt with the article URL
prompt = """Read this article and summarize its key findings:
https://quedigital.com.ar/sociedad/el-archivo-2025-de-la-correpi-la-represion-y-el-gatillo-facil-continuan-en-alza/
"""

# Configure tools: UrlContext to read links + GoogleSearch for fallback search grounding
config = types.GenerateContentConfig(
    tools=[
        types.Tool(url_context=types.UrlContext()),
        types.Tool(google_search=types.GoogleSearch()),
    ]
)

# Run the request using Gemini
response = client.models.generate_content(
    model="gemini-3.5-flash-lite",
    contents=prompt,
    config=config
)

# Print the response
print(response.text)


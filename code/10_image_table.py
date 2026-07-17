from dotenv import load_dotenv
import os

load_dotenv()  # Automatically finds .env file
api_key = os.getenv('GEMINI_API_KEY')

import json
from google import genai
from google.genai import types
from PIL import Image
from pydantic import BaseModel, Field

# 1. Define the structure you want the model to return.
# This forces Gemini to return reliable JSON matching your exact needs.
class TableRow(BaseModel):
    name: str = Field(description="The full name extracted from the row")
    extra_details: str = Field(description="Any other text, notes, or data associated with this name in the row")

class ExtractedTable(BaseModel):
    rows: list[TableRow] = Field(description="List of all rows extracted from the table image")

def transcribe_table_image(image_path: str):
    # Initialize the client. It automatically picks up GEMINI_API_KEY from the environment.
    client = genai.Client()
    
    # Open the image file using Pillow
    try:
        img = Image.open(image_path)
    except FileNotFoundError:
        print(f"Error: The file '{image_path}' was not found.")
        return None
    except Exception as e:
        print(f"Error opening image: {e}")
        return None

    print(f"Sending {image_path} to Gemini 3.5 Flash for OCR parsing...")
    
    # Call the model
    response = client.models.generate_content(
        # model='gemini-3.5-flash',
        model='gemini-3.1-flash-lite',
        contents=[
            img, 
            "Transcribe this table accurately. Extract every name and any data associated with it. "
            "If the handwritten or printed text is slightly blurry, use context clues to infer the correct spelling."
        ],
        config=types.GenerateContentConfig(
            # Force the model to output strict JSON matching our Pydantic schema
            response_mime_type="application/json",
            response_schema=ExtractedTable,
            temperature=0.1, # Low temperature keeps OCR precise and deterministic
        ),
    )
    
    # Parse and return the structured JSON string back into a Python dictionary
    return json.loads(response.text)

if __name__ == "__main__":
    # Replace this with the path to one of your photos
    image_file = "data/IMG_20260717_114056567.jpg" 
    
    # Ensure your API key environment variable is active
    if not os.environ.get("GEMINI_API_KEY"):
        print("Error: GEMINI_API_KEY environment variable is not set.")
        print("Run: export GEMINI_API_KEY='your_key'")
    else:
        result = transcribe_table_image(image_file)
        
        if result:
            print("\n--- Extraction Successful ---\n")
            print(json.dumps(result, indent=2))
            
            # Example of how you can loop through the data in Python:
            print("\nProcessed Rows:")
            for item in result["rows"]:
                print(f"• Name: {item['name']} | Details: {item['extra_details']}")
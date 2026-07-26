from pathlib import Path
from google import genai
import pandas as pd

base_dir = Path.cwd()
excel_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía.xlsx"

df = pd.read_excel(excel_path)

from dotenv import load_dotenv
import os

load_dotenv()  # Automatically finds .env file
api_key = os.getenv('GEMINI_API_KEY')


for index, row in df.iterrows():
    print(f"Row {index}:")
    print(row.to_dict())
    print("-" * 40)

client = genai.Client(
    api_key=api_key, http_options={"api_version": "v1alpha"}
)
# client = genai.Client(api_key=api_key)
# client = genai.Client()

interaction = client.interactions.create(
    model="gemma-4-31b-it",
    # model="gemini-3.5-flash",
    input="Hola."
)
print(interaction.output_text)

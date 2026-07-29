#!/usr/bin/env python3
"""
20_LLM_extract_names.py
--------------
Extracts names of people mentioned in articles html code.

Usage:
    python 20_LLM_extract_names.py

Dependencies:
    dotenv, pathlib, pandas, genai
    
Make sure to set your Google AI Studio API key in a .env file as follows:
    GEMINI_API_KEY=your_google_ai_studio_api_key
"""

import json
import os
import time
from pathlib import Path

from google import genai
import pandas as pd
from dotenv import load_dotenv

base_dir = Path.cwd()
csv_path = base_dir / ".." / "data" / "Monitoreo noticias with diffbot fields.csv"

df = pd.read_csv(csv_path)
print(f"Number of rows in DataFrame: {len(df)}")

load_dotenv()  # Automatically finds .env file
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    raise RuntimeError("Falta GEMINI_API_KEY en el entorno o en .env")

MODEL_NAME = "gemini-3.5-flash-lite"


n_i = 0
n_f = 5

question = "Extrae los nombres de las personas mencionadas en el artículo. Devuelve la respuesta en formato JSON con una lista de nombres bajo la clave 'nombres'. Si no se pueden determinar nombres, devuelve un JSON con una lista vacía. Incluye el ID del artículo en el objeto JSON."

client = genai.Client(api_key=api_key)

for index, row in df.iloc[n_i:n_f].iterrows():
    article_id = str(row["ID"]).strip()
    html_code = str(row["diffbot_html"]).strip()
    if not html_code or html_code == "nan":
        print(f"Row {index} (ID: {article_id}) has no HTML code. Skipping.")
        continue

    prompt = f"Responde en español. {question}\n\nID del artículo: {article_id}\nHTML: {html_code}"
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    response_text = response.text or ""
    # response_tokens = count_tokens(client, MODEL_NAME, response_text)

    print(f"\n[{index}] Article ID: {article_id}")
    print("-" * 80)
    print(response_text)
    print("-" * 80)



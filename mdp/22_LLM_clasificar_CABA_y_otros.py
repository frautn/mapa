#!/usr/bin/env python3
"""
22_LLM_clasificar_CABA_y_otros.py
--------------
Determina si el hecho ocurrió en CABA.
Busca: ubicación, fuerza de seguridad, fecha del hecho.

Usage:
    python 22_LLM_clasificar_CABA_y_otros.py

Dependencies:
    dotenv, pathlib, pandas, genai
    
Make sure to set your Google AI Studio API key in a .env file as follows:
    GEMINI_API_KEY=your_google_ai_studio_api_key
"""

import json
import os
import re
import time
from pathlib import Path

from google import genai
from google.genai.errors import ClientError
import pandas as pd
from dotenv import load_dotenv

base_dir = Path.cwd()
csv_path = base_dir / ".." / "data" / "Monitoreo noticias with diffbot fields.csv"

df_articles = pd.read_csv(csv_path)
print(f"Number of rows in DataFrame: {len(df_articles)}")

df_articles = df_articles[:50]

load_dotenv()  # Automatically finds .env file
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    raise RuntimeError("Falta GEMINI_API_KEY en el entorno o en .env")

MODEL_NAME = "gemini-3.5-flash-lite"

n_i = 0
n_f = 50

question = "Responde 'SI', 'NO', o 'NO SE PUEDE DETERMINAR' si el hecho ocurrió en CABA. Además, indica la ubicación, la fuerza de seguridad involucrada y la fecha del hecho si es posible. Con esta información, genera un JSON con las claves: 'ID', 'ocurrio_en_CABA', 'ubicacion', 'fuerza_de_seguridad', 'fecha_del_hecho'. Si no se puede determinar alguna de estas claves, asigna el valor 'NO SE PUEDE DETERMINAR'."

client = genai.Client(api_key=api_key)

MAX_RETRIES = 5
INITIAL_BACKOFF_SECONDS = 2


def extract_json_object(text: str) -> dict:
    """Extract the first JSON object from a model response text."""
    if not text:
        return {}

    cleaned = text.strip()

    # Handle Markdown code fences like ```json ... ```.
    fenced_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, flags=re.DOTALL)
    if fenced_match:
        cleaned = fenced_match.group(1)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: find the first balanced {...} block.
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start:end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            return {}

    return {}


def generate_with_retry(prompt: str, model_name: str) -> tuple[str, str]:
    """Return (response_text, error_message). Retries on 429 and never raises."""
    backoff = INITIAL_BACKOFF_SECONDS

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            return (response.text or "", "")
        except ClientError as exc:
            error_text = str(exc)
            is_rate_limit = "429" in error_text or "RESOURCE_EXHAUSTED" in error_text

            if is_rate_limit and attempt < MAX_RETRIES:
                print(
                    f"Rate limit (429) on attempt {attempt}/{MAX_RETRIES}. "
                    f"Retrying in {backoff}s..."
                )
                time.sleep(backoff)
                backoff *= 2
                continue

            return ("", error_text)
        except Exception as exc:  # Failsafe for unexpected SDK/network errors.
            return ("", str(exc))

    return ("", "Unknown error after retries")


results = []
for index, row in df_articles.iloc[n_i:n_f].iterrows():
    article_id = str(row["ID"]).strip()
    html_code = str(row["diffbot_html"]).strip()
    if not html_code or html_code == "nan":
        print(f"Row {index} (ID: {article_id}) has no HTML code. Skipping.")
        continue

    prompt = f"Responde en español. {question}\n\nID del artículo: {article_id}\nHTML: {html_code}"
    response_text, error_message = generate_with_retry(prompt, MODEL_NAME)

    if error_message:
        print(f"\n[{index}] Article ID: {article_id}")
        print("-" * 80)
        print(f"Error calling model: {error_message}")
        print("-" * 80)
        results.append(
            {
                "ID": article_id,
                "ocurrio_en_CABA": "NO SE PUEDE DETERMINAR",
                "ubicacion": "NO SE PUEDE DETERMINAR",
                "fuerza_de_seguridad": "NO SE PUEDE DETERMINAR",
                "fecha_del_hecho": "NO SE PUEDE DETERMINAR",
                "raw_response": "",
                "error": error_message,
            }
        )
        continue

    # response_tokens = count_tokens(client, MODEL_NAME, response_text)

    print(f"\n[{index}] Article ID: {article_id}")
    print("-" * 80)
    print(response_text)
    print("-" * 80)

    parsed = extract_json_object(response_text)
    if parsed:
        parsed.setdefault("ID", article_id)
        results.append(parsed)
    else:
        results.append(
            {
                "ID": article_id,
                "ocurrio_en_CABA": "NO SE PUEDE DETERMINAR",
                "ubicacion": "NO SE PUEDE DETERMINAR",
                "fuerza_de_seguridad": "NO SE PUEDE DETERMINAR",
                "fecha_del_hecho": "NO SE PUEDE DETERMINAR",
                "raw_response": response_text,
            }
        )


if results:
    output_path = base_dir / ".." / "data" / f"clasificacion_caba_{n_i}_{n_f}.csv"
    pd.DataFrame(results).to_csv(output_path, index=False)
    print(f"Saved {len(results)} rows to: {output_path}")
else:
    print("No rows were processed. CSV file was not created.")




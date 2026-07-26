from pathlib import Path
import os
import pandas as pd
from dotenv import load_dotenv
from google import genai

base_dir = Path.cwd()
excel_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía.xlsx"

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("Falta GEMINI_API_KEY en el entorno o en .env")

MODEL_NAME = "gemini-3.5-flash-lite"


def normalize_column_name(column_name: str) -> str:
    return "".join(ch.lower() for ch in column_name if ch.isalnum())


def find_title_column(df: pd.DataFrame) -> str:
    normalized_columns = {normalize_column_name(col): col for col in df.columns}
    for candidate in ["titulo", "título", "tituloo", "title"]:
        if candidate in normalized_columns:
            return normalized_columns[candidate]
    for column in df.columns:
        if "titulo" in normalize_column_name(column):
            return column
    raise KeyError("No encontré una columna de título en el dataframe")


def count_tokens(client, model_name: str, text: str):
    if not text:
        return 0

    try:
        response = client.models.count_tokens(model=model_name, contents=text)
        return getattr(response, "total_tokens", None) or getattr(response, "totalTokens", None)
    except Exception as exc:
        print(f"⚠️ No se pudo contar tokens: {exc}")
        return None


df = pd.read_excel(excel_path)
title_column = find_title_column(df)

sampled_df = df.sample(n=min(10, len(df)), random_state=42)
question = "¿En qué ciudad ocurre? La respuesta debe ser solo la ciudad donde ocurre. Si no se puede determinar, responde Sin definir'"

client = genai.Client(api_key=api_key)

for index, row in sampled_df.iterrows():
    title = str(row[title_column]).strip()
    if not title or title == "nan":
        continue

    prompt = f"Responde en español. {question}\n\nTítulo: {title}"
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    prompt_tokens = count_tokens(client, MODEL_NAME, prompt)
    response_text = response.text or ""
    response_tokens = count_tokens(client, MODEL_NAME, response_text)

    print(f"\n[{index}] {title}")
    print("-" * 80)
    print(response_text)
    print("-" * 80)
    print(f"Tokens del prompt: {prompt_tokens}")
    print(f"Tokens de la respuesta: {response_tokens}")
    if prompt_tokens is not None and response_tokens is not None:
        print(f"Tokens totales de la interacción: {prompt_tokens + response_tokens}")

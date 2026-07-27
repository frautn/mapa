#!/usr/bin/env python3
"""
12_diffbot_process_list.py
--------------
Loops through a list of URLs and fetches article data from the Diffbot API for each URL.
Stores the results in a json file for further processing.
Subtitles might be missing in the results.

Usage:
    python 12_diffbot_process_list.py

Dependencies:
    requests, dotenv, pathlib, pandas
    
Make sure to set your Diffbot API key in a .env file as follows:
    DIFFBOT_API_KEY=your_diffbot_api_key
"""

import requests

from dotenv import load_dotenv
import os
load_dotenv()  # Automatically finds .env file
api_key = os.getenv('DIFFBOT_API_KEY')


from pathlib import Path
import pandas as pd

base_dir = Path.cwd()
csv_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía_with_ID.csv"

df = pd.read_csv(csv_path)
print(f"Number of rows in DataFrame: {len(df)}")

headers = {"accept": "application/json"}

n_i = 0
n_f = 5

print(f"Processing rows {n_i} to {n_f} from DataFrame...")

for index, row in df.iloc[n_i:n_f].iterrows():
    link = row.get("Link")
    if pd.isna(link) or not str(link).strip():
        print(f"Skipping row {index}: missing link")
        continue

    try:
        response = requests.get(link, headers=headers, timeout=15)
        print(f"Row {index}: status={response.status_code} -> {link}")
        print(response.text)
    except requests.RequestException as exc:
        print(f"Row {index}: request failed for {link}: {exc}")

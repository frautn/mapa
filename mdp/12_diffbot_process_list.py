#!/usr/bin/env python3
"""
12_diffbot_process_list.py
--------------
Loops through a list of URLs and fetches article data from the Diffbot API for each URL.
Stores the results in a new csv file (from a pandas DataFrame) for further processing.
Subtitles might be missing in the results.

Usage:
    python 12_diffbot_process_list.py

Dependencies:
    requests, dotenv, pathlib, pandas
    
Make sure to set your Diffbot API key in a .env file as follows:
    DIFFBOT_API_KEY=your_diffbot_api_key
"""

import json
import os
import time
from pathlib import Path

import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()  # Automatically finds .env file
api_key = os.getenv('DIFFBOT_API_KEY')

base_dir = Path.cwd()
csv_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía_with_ID.csv"

df = pd.read_csv(csv_path)
print(f"Number of rows in DataFrame: {len(df)}")

df["diffbot_response"] = None

n_i = 0
n_f = 5

print(f"Processing rows {n_i} to {n_f} from DataFrame...")

url = f"https://api.diffbot.com/v3/article?token={api_key}"
headers = {}


for index, row in df.iloc[n_i:n_f].iterrows():
    link = row.get("Link")
    if pd.isna(link) or not str(link).strip():
        print(f"Skipping row {index}: missing link")
        continue

    try:
        params = {
            "url": link
        }
        response = requests.request("GET", url, params=params, headers=headers)
        print(f"Row {index}: status={response.status_code}")
        response_json = response.json()
        df.at[index, "diffbot_response"] = json.dumps(response_json)
    except requests.RequestException as exc:
        print(f"Row {index}: request failed for {link}: {exc}")

    time.sleep(65) # Sleep for 65 seconds to avoid hitting the rate limit

output_csv_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía_with_ID_diffbot_response.csv"
df.to_csv(output_csv_path, index=False)
print(f"Saved dataframe to {output_csv_path}")

#!/usr/bin/env python3
"""
15_diffbot_process_list.py
--------------
Loops through a list of URLs and fetches article data from the Diffbot API for each URL.
Stores the results updating the csv file (from a pandas DataFrame) for further processing.
Articles subtitles might be missing in the results.

Usage:
    python 15_diffbot_process_list.py

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
csv_path = base_dir / ".." / "data" / "Monitoreo noticias with articles.csv"
output_csv_path = csv_path

df = pd.read_csv(csv_path)
print(f"Number of rows in DataFrame: {len(df)}")

n_i = 879
n_f = 1000

print(f"Processing rows {n_i} to {n_f} from DataFrame...")
print("Waiting 1 minute between requests to avoid hitting the rate limit...")

if "diffbot_response" not in df.columns:
    df["diffbot_response"] = pd.NA

url = f"https://api.diffbot.com/v3/article?token={api_key}"
headers = {}

subset = df.iloc[n_i:n_f]


# Filter only rows that do not have a diffbot response already.
def needs_diffbot_response(value):
    if pd.isna(value):
        return True
    if not isinstance(value, str):
        return True
    text = value.strip()
    if not text:
        return True
    try:
        parsed = json.loads(text)
    except (ValueError, TypeError):
        return True
    return not (isinstance(parsed, dict) and "request" in parsed)

missing_response = subset["diffbot_response"].apply(needs_diffbot_response)

for index, row in subset[missing_response].iterrows():
    print(f"Processing row {index} (ID = {row.get('ID')})...", end="")
    link = row.get("Link")
    if pd.isna(link) or not str(link).strip():
        print(f" skipping, missing link")
        continue

    try:
        params = {
            "url": link
        }
        response = requests.request("GET", url, params=params, headers=headers)
        print(f" status={response.status_code}")
        response_json = response.json()
        df.at[index, "diffbot_response"] = json.dumps(response_json)
        df.to_csv(output_csv_path, index=False)
    except requests.RequestException as exc:
        print(f" request failed: {exc}")

    time.sleep(65)  # Sleep for 65 seconds to avoid hitting the rate limit


print(f"Saved dataframe to {output_csv_path}")

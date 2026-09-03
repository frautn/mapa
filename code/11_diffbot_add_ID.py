#!/usr/bin/env python3
"""
11_diffbot_add_ID.py
--------------
Adds an ID column to a DataFrame containing article data.
Saves the updated DataFrame to csv file for further processing.

Usage:
    python 11_diffbot_add_ID.py

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
excel_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía.xlsx"

df = pd.read_excel(excel_path)
print(f"Loaded {len(df)} rows from Excel file: {excel_path}.")

df['ID'] = range(1, len(df) + 1)
df = df[['ID'] + [col for col in df.columns if col != 'ID']]
print("Added 'ID' column to DataFrame.")

output_csv_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía_with_ID.csv"
df.to_csv(output_csv_path, index=False)
print(f"Saved DataFrame to CSV file: {output_csv_path}.")


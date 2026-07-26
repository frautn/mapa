#!/usr/bin/env python3
"""
12_diffbot_process_list.py
--------------
Loops through a list of URLs and fetches article data from the Diffbot API for each URL.
Stores the results in a json file for further processing.

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
excel_path = base_dir / ".." / "data" / "Monitoreo noticias – Mapa de la Policía.xlsx"

print(f"Number of rows in DataFrame: {len(df)}")


# url = "https://api.diffbot.com/v3/article?url=https%3A%2F%2Fwww.technologyreview.com%2F2020%2F09%2F04%2F1008156%2Fknowledge-graph-ai-reads-web-machine-learning-natural-language-processing%2F&token=" + api_key

# headers = {"accept": "application/json"}

# response = requests.get(url, headers=headers)

# print(response.text)
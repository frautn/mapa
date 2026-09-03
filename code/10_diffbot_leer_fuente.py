#!/usr/bin/env python3
"""
10_diffbot_leer_fuente.py
--------------
Fetches article data from the Diffbot API and prints the response.

Usage:
    python 10_diffbot_leer_fuente.py

Dependencies:
    requests, dotenv
Make sure to set your Diffbot API key in a .env file as follows:
    DIFFBOT_API_KEY=your_diffbot_api_key
"""

import requests

from dotenv import load_dotenv
import os
load_dotenv()  # Automatically finds .env file
api_key = os.getenv('DIFFBOT_API_KEY')


url = "https://api.diffbot.com/v3/article?url=https%3A%2F%2Fwww.technologyreview.com%2F2020%2F09%2F04%2F1008156%2Fknowledge-graph-ai-reads-web-machine-learning-natural-language-processing%2F&token=" + api_key

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

print(response.text)
#!/usr/bin/env python3
"""
14_diffbot_credits.py
--------------
Fetches credit information from the Diffbot API.

Usage:
    python 14_diffbot_credits.py

Dependencies:
    requests, dotenv, pathlib, pandas
    
Make sure to set your Diffbot API key in a .env file as follows:
    DIFFBOT_API_KEY=your_diffbot_api_key
"""

import requests
import json

from dotenv import load_dotenv
import os
load_dotenv()  # Automatically finds .env file
api_key = os.getenv('DIFFBOT_API_KEY')


url = f"https://api.diffbot.com/v4/account?token={api_key}"

headers = {"accept": "application/json"}

response = requests.get(url, headers=headers)

response_json = response.json()
total_credits = 0
for u in response_json['usage']:
    total_credits += u['credits']
print("-")
print(f"Total créditos usados en los últimos 31 días: {total_credits}")
print("-")

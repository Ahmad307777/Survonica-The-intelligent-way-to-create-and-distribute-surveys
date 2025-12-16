
import requests
import json
import os
from dotenv import load_dotenv

def test_save_survey():
    # Load env but we are mostly testing the running server
    print("Attempting to create a survey via API...")
    
    url = "http://localhost:8000/api/surveys/"
    
    # Payload matching the frontend structure
    payload = {
        "title": "Debug Survey",
        "description": "Created via debug script",
        "questions": [
            {
                "text": "What is your favorite color?",
                "type": "text",
                "required": True
            }
        ],
        "template": "single-column",
        "require_qualification": False,
        "design": {
            "fontFamily": "font-sans",
            "primaryColor": "#3b82f6",
            "backgroundColor": "#f8fafc"
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print("JSON Response:", json.dumps(data, indent=2))
        except json.JSONDecodeError:
            print("Response is NOT JSON. Likely HTML Error Page.")
            print("-" * 40)
            print(response.text[:2000]) # Print first 2000 chars to see error details
            print("-" * 40)

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_save_survey()

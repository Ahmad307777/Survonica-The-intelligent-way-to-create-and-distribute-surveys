
import requests
import json
import os

def test_update_survey():
    # Use the ID created in the previous step
    survey_id = "693fe9c5a1473f123cce993b"
    url = f"http://localhost:8000/api/surveys/{survey_id}/"
    
    print(f"Attempting to UPDATE survey {survey_id}...")
    
    payload = {
        "title": "Debug Survey UPDATED",
        "description": "Updated description",
        "questions": [
            {
                "text": "Updated Question?",
                "type": "text",
                "required": True
            }
        ],
        "template": "minimalist",
        "require_qualification": True,
        "design": {
            "fontFamily": "font-sans",
            "primaryColor": "#ff0000",
            "backgroundColor": "#ffffff"
        }
    }
    
    try:
        response = requests.put(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print("JSON Response:", json.dumps(data, indent=2))
        except json.JSONDecodeError:
            print("Response is NOT JSON.")
            print("-" * 40)
            print(response.text[:2000])
            print("-" * 40)

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_update_survey()

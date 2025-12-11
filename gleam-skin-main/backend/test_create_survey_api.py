import httpx
import json

url = "http://localhost:8000/api/surveys/"
data = {
    "title": "Test Survey Atlas Debug",
    "description": "Testing if this saves to Atlas",
    "questions": [{"id": "q1", "text": "Is this working?", "type": "text"}]
}

try:
    print(f"Sending POST to {url}...")
    response = httpx.post(url, json=data, timeout=10.0)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

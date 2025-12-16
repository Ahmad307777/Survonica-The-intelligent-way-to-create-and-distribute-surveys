
import requests
import json
import os

def test_send_invite():
    # Use the known existing survey ID
    survey_id = "693fe9c5a1473f123cce993b" 
    # Or fetch one if that one is gone
    
    url = f"http://localhost:8000/api/surveys/{survey_id}/send_invite/"
    
    # Payload matching logic in MySurveys.tsx
    # const emails = emailRecipients.split(',').map(e => e.trim()).filter(e => e);
    # JSON.stringify({ emails, ... })
    
    payload = {
        "emails": ["s3327066437@gmail.com"], # Sending to the user's working email
        "domain_restriction": "public",
        "allowed_domain": None
    }
    
    print(f"Testing API: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print("Response JSON:", json.dumps(data, indent=2))
        except json.JSONDecodeError:
            print("Response is NOT JSON (likely HTML error):")
            print(response.text[:1000])

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_send_invite()

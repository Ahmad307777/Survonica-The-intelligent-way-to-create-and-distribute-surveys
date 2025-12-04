import requests
import json

print("Testing registration with detailed output...\n")

url = "http://localhost:8000/api/auth/register/"
data = {
    "username": "testuser999",
    "email": "test999@example.com", 
    "password": "password123"
}

print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}\n")

try:
    # First, test OPTIONS (preflight)
    print("1. Testing OPTIONS (preflight)...")
    options_response = requests.options(
        url,
        headers={
            "Origin": "http://localhost:8080",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        }
    )
    print(f"   Status: {options_response.status_code}")
    print(f"   Headers:")
    for key, value in options_response.headers.items():
        if 'access-control' in key.lower() or 'allow' in key.lower():
            print(f"     {key}: {value}")
    
    # Then test actual POST
    print("\n2. Testing POST...")
    response = requests.post(
        url,
        json=data,
        headers={
            "Content-Type": "application/json",
            "Origin": "http://localhost:8080"
        }
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code in [200, 201]:
        print("\n✅ SUCCESS! Registration works.")
    else:
        print(f"\n❌ Failed with status {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Error: {type(e).__name__}: {e}")

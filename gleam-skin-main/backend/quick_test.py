import requests
import json

print("Testing backend connection...")

# Test 1: Check if backend is running
try:
    response = requests.get("http://127.0.0.1:8000/api/auth/user/")
    print(f"✅ Backend is running! Status: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.ConnectionError:
    print("❌ Backend is NOT running!")
    print("Start it with: .\\venv\\Scripts\\python.exe manage.py runserver")
    exit(1)

# Test 2: Try registration
print("\nTesting registration...")
try:
    response = requests.post(
        "http://127.0.0.1:8000/api/auth/register/",
        json={"username": "testuser999", "email": "test999@example.com", "password": "password123"},
        headers={"Content-Type": "application/json"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("\n✅ Registration works! Check MongoDB Compass.")
    else:
        print(f"\n❌ Registration failed: {response.json()}")
except Exception as e:
    print(f"❌ Error: {e}")

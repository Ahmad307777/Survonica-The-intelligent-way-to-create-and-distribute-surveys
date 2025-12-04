import requests
import json
import sys

print("=" * 60)
print("BACKEND DIAGNOSTIC TEST")
print("=" * 60)

# Test 1: Check if backend is running
print("\n1. Checking if backend is running...")
try:
    response = requests.get("http://127.0.0.1:8000/api/auth/user/", timeout=5)
    print(f"   ✅ Backend is running (Status: {response.status_code})")
except requests.exceptions.ConnectionError:
    print("   ❌ BACKEND IS NOT RUNNING!")
    print("   → Start it: .\\venv\\Scripts\\python.exe manage.py runserver")
    sys.exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

# Test 2: Check CORS with localhost
print("\n2. Testing CORS from localhost...")
try:
    response = requests.options(
        "http://localhost:8000/api/auth/register/",
        headers={
            "Origin": "http://localhost:8080",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    print(f"   CORS Headers: {dict(response.headers)}")
    if 'Access-Control-Allow-Origin' in response.headers:
        print(f"   ✅ CORS is configured")
    else:
        print(f"   ❌ CORS headers missing!")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Try actual registration
print("\n3. Testing registration endpoint...")
test_data = {
    "username": "diagnostic_test",
    "email": "diagnostic@test.com",
    "password": "testpass123"
}

try:
    response = requests.post(
        "http://localhost:8000/api/auth/register/",
        json=test_data,
        headers={
            "Content-Type": "application/json",
            "Origin": "http://localhost:8080"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("   ✅ Registration endpoint works!")
    elif response.status_code == 400:
        print("   ⚠️  Validation error (expected if user exists)")
    else:
        print(f"   ❌ Unexpected status: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("DIAGNOSIS COMPLETE")
print("=" * 60)

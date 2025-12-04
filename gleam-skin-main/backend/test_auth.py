import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_registration():
    """Test user registration"""
    print("Testing Registration...")
    
    # Test data
    user_data = {
        "username": "testuser123",
        "email": "test123@example.com",
        "password": "password123"
    }
    
    print(f"Sending: {json.dumps(user_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register/",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("\n✅ SUCCESS! User registered.")
            print("Check MongoDB Compass - you should see 'gleam_surveys' database with 'user' collection")
        else:
            print(f"\n❌ FAILED: {response.json()}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend. Make sure it's running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

def test_login():
    """Test user login"""
    print("\n\nTesting Login...")
    
    login_data = {
        "username": "testuser123",
        "password": "password123"
    }
    
    print(f"Sending: {json.dumps(login_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("\n✅ SUCCESS! User logged in.")
        else:
            print(f"\n❌ FAILED: {response.json()}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

if __name__ == "__main__":
    print("=" * 50)
    print("AUTHENTICATION TEST")
    print("=" * 50)
    test_registration()
    test_login()
    print("\n" + "=" * 50)

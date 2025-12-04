import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_mongo_integration():
    print("Waiting for server to start...")
    time.sleep(5)
    
    # 1. Login (using SQLite User)
    print("Logging in...")
    try:
        auth_response = requests.post(f"{BASE_URL}/auth/login/", json={
            "username": "testuser",
            "password": "password123"
        })
    except requests.exceptions.ConnectionError:
        print("Server not reachable.")
        return
    
    # If login fails, try registering
    if auth_response.status_code != 200:
        print("Login failed, trying to register...")
        auth_response = requests.post(f"{BASE_URL}/auth/register/", json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        })
    
    if auth_response.status_code != 200:
        print(f"Auth failed: {auth_response.text}")
        return

    print("Logged in successfully.")
    # Django uses sessionid cookie for auth
    cookies = auth_response.cookies

    # 2. Create Survey (MongoDB)
    print("Creating Survey...")
    survey_data = {
        "title": "Mongo Test Survey",
        "description": "Testing MongoDB integration",
        "questions": [{"text": "Is this working?", "type": "yes_no"}]
    }
    create_response = requests.post(f"{BASE_URL}/surveys/", json=survey_data, cookies=cookies)
    
    if create_response.status_code != 201:
        print(f"Create Survey failed: {create_response.text}")
        return

    survey_id = create_response.json()['id']
    print(f"Survey created with ID: {survey_id}")

    # 3. List Surveys
    print("Listing Surveys...")
    list_response = requests.get(f"{BASE_URL}/surveys/", cookies=cookies)
    surveys = list_response.json()
    print(f"Found {len(surveys)} surveys.")
    
    found = any(s['id'] == survey_id for s in surveys)
    if found:
        print("SUCCESS: Created survey found in list.")
    else:
        print("FAILURE: Created survey NOT found in list.")

if __name__ == "__main__":
    test_mongo_integration()


import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_api():
    print(f"Testing API at {BASE_URL}...")
    
    # 1. List Surveys
    try:
        print("\n1. Listing Surveys...")
        res = requests.get(f"{BASE_URL}/surveys/")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            surveys = res.json()
            print(f"Found {len(surveys)} surveys.")
            if surveys:
                first_id = surveys[0]['id']
                print(f"First Survey ID: {first_id}")
                
                # 2. Fetch Single Survey
                print(f"\n2. Fetching Survey {first_id}...")
                res_detail = requests.get(f"{BASE_URL}/surveys/{first_id}/")
                print(f"Status: {res_detail.status_code}")
                # print(res_detail.text[:200])
                
                # 3. Fetch Responses
                print(f"\n3. Fetching Responses for {first_id}...")
                res_resp = requests.get(f"{BASE_URL}/survey-responses/?survey={first_id}")
                print(f"Status: {res_resp.status_code}")
                # print(res_resp.text[:200])
                
            else:
                print("No surveys found to test detail fetch.")
        else:
            print("Failed to list surveys.")
            print(res.text)
            
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_api()

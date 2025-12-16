
import os
import sys
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
from bson.objectid import ObjectId

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)

def migrate_data():
    prod_uri = os.getenv('MONGO_URI')
    
    # Construct 'test' URI
    base_uri = prod_uri.split('?')[0]
    if 'gleam_surveys' in base_uri:
        base_uri = base_uri.replace('/gleam_surveys', '')
    test_uri = f"{base_uri}/test?{prod_uri.split('?')[1]}"
    
    print("Connecting to databases...")
    client = MongoClient(prod_uri, tlsCAFile=certifi.where())
    
    db_prod = client.gleam_surveys
    db_test = client.test
    
    print(f"Source: {db_test.name}")
    print(f"Target: {db_prod.name}")
    
    # Migrate Surveys
    print("\nMigrating Surveys...")
    surveys = list(db_test.survey.find())
    count = 0
    target_user_id = ObjectId("693903e0f52e109bec83b469") # Ahmad Mustafa

    for s in surveys:
        # Check if already exists by title/content to avoid dupe? 
        # Or just insert. For now, just insert.
        # But we must update owner
        s['owner'] = target_user_id
        
        # Remove _id to let mongo generate new one (or keep same if unique)
        # Using same _id is risky if conflict, but preserving ID is good for links.
        # Let's try to find if ID exists in prod
        existing = db_prod.survey.find_one({"_id": s['_id']})
        if not existing:
            db_prod.survey.insert_one(s)
            print(f"Moved: {s.get('title')}")
            count += 1
            # Optionally delete from test? Let's copy first.
        else:
            print(f"Skipping (Already exists): {s.get('title')}")
            
    print(f"Successfully migrated {count} surveys.")
    
    # Clean up test? (Optional, user didn't explicitly say delete, but said 'remove local')
    # Use 'remove local' usually meant 'stop using'. I will leave data in test as backup.

if __name__ == "__main__":
    migrate_data()

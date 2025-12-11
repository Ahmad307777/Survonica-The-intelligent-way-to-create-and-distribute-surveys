import os
import mongoengine
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv(override=True)

mongo_uri = os.getenv('MONGO_URI')
print(f"Testing connection to: {mongo_uri.split('@')[-1] if '@' in str(mongo_uri) else 'Local'}")

try:
    mongoengine.connect(host=mongo_uri)
    print("Connection successful!")
    print(f"Database: {mongoengine.connection.get_db().name}")
    print("Collections:", mongoengine.connection.get_db().list_collection_names())
except Exception as e:
    print(f"Connection failed: {e}")

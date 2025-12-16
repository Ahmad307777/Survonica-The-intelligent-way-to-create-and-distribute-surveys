
import os
import sys
import mongoengine
from mongoengine.connection import get_connection

# Add backend to path to import settings
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def check_connection():
    print("Attempting to connect to MongoDB...")
    
    # Try to connect using the default local settings first, similar to settings.py
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/gleam_surveys')
    print(f"Using URI: {mongo_uri}")
    
    try:
        mongoengine.connect(host=mongo_uri)
        conn = get_connection()
        print("Successfully connected to MongoDB!")
        
        # Try a simple operation
        print("Server info:", conn.server_info())
        print("Database list:", conn.list_database_names())
        
    except Exception as e:
        print(f"FAILED to connect: {e}")

if __name__ == "__main__":
    check_connection()

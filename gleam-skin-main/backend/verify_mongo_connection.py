import os
import mongoengine
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv(override=True)

mongo_uri = os.getenv('MONGO_URI')
print(f"Testing connection to: {mongo_uri.split('@')[-1] if '@' in str(mongo_uri) else 'Local'}")

import certifi
import urllib.request

try:
    my_ip = urllib.request.urlopen('https://api.ipify.org').read().decode('utf8')
    print(f"Current Public IP: {my_ip}")
except:
    print("Could not determine IP")

try:
    print("Attempting insecure connection (tlsAllowInvalidCertificates=True)...")
    mongoengine.connect(host=mongo_uri, tlsAllowInvalidCertificates=True)
    print("Connection successful! (Insecure)")
    print(f"Database: {mongoengine.connection.get_db().name}")
    print("Collections:", mongoengine.connection.get_db().list_collection_names())
except Exception as e:
    print(f"Connection failed: {e}")
    exit(1)

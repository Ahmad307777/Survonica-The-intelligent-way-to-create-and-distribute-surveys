import os
import mongoengine
from dotenv import load_dotenv

load_dotenv(override=True)

mongo_uri = os.getenv('MONGO_URI')
print(f"Connecting to: {mongo_uri.split('@')[-1]}")

try:
    mongoengine.connect(host=mongo_uri)
    print("Connected to Atlas.")
    
    from surveys.models import Survey
    
    # ID from the previous test run
    target_id = "69390309d014f071ddf9c0b3"
    
    try:
        survey = Survey.objects.get(id=target_id)
        print(f"FAILED TO FIND? No, FOUND IT!")
        print(f"Survey Found: {survey.title}")
        print(f"ID: {survey.id}")
    except Survey.DoesNotExist:
        print(f"Survey {target_id} NOT FOUND in Atlas.")
        
        # Check count
        print(f"Total Surveys in Atlas: {Survey.objects.count()}")

except Exception as e:
    print(f"Error: {e}")

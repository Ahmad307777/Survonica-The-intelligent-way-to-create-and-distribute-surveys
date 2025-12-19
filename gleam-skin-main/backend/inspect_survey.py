
import os
import sys
from mongoengine import connect
from surveys.models import Survey, SurveyResponse
from dotenv import load_dotenv

load_dotenv()

def inspect_survey():
    # Connect to Mongo
    mongo_uri = os.getenv('MONGO_URI')
    print(f"Connecting to MongoDB... {mongo_uri[:10]}...")
    connect(host=mongo_uri, db='gleam_surveys')
    
    # Try to find the survey
    # The ID from previous debug output was 693945ae14fe29895a51c627
    # Note: If that was a generated ID from mock, it might not be real.
    # But let's list all surveys to find the "Elon Musk" one.
    
    print("\n--- Searching for 'Elon Musk' Survey ---")
    surveys = Survey.objects(title__icontains="Elon Musk")
    
    if not surveys:
        print("No survey found with title containing 'Elon Musk'. Listing all:")
        for s in Survey.objects.all()[:5]:
            print(f"- {s.id}: {s.title}")
        return

    survey = surveys[0]
    print(f"Found Survey: {survey.id} - {survey.title}")
    print(f"Question Count: {len(survey.questions)}")
    print("Questions:")
    for q in survey.questions:
        print(q)
        
    print(f"\nResponse Count: {SurveyResponse.objects(survey=survey).count()}")
    responses = SurveyResponse.objects(survey=survey)
    if responses:
        print("First Response Data:")
        print(responses[0].responses)

if __name__ == "__main__":
    # Add backend to sys.path
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    inspect_survey()

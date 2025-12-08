from mongoengine import connect, Document, StringField, ListField, BooleanField, IntField, DateTimeField, DictField, ReferenceField
import datetime
import sys

# Connect to MongoDB
print("Connecting to MongoDB...")
connect(db='gleam_surveys', host='mongodb://localhost:27017/gleam_surveys')

# Define Models (Mirroring valid parts of actual models)
class Survey(Document):
    user_id = StringField(required=True)
    title = StringField(max_length=255, required=True)
    questions = ListField(DictField())
    meta = {'collection': 'survey'} # Explicit collection name to match default

class QualificationTest(Document):
    survey = ReferenceField(Survey)
    topic = StringField(max_length=255, required=True)
    questions = ListField(DictField())
    meta = {'collection': 'qualification_test'} # Explicit collection name to match default

def verify():
    print("Creating test data...")
    
    # 1. Create Survey
    survey = Survey(
        user_id="test_verifier",
        title="Verification Survey",
        questions=[{"text": "Q1", "type": "text"}]
    )
    survey.save()
    print(f"Created Survey ID: {survey.id}")

    # 2. Create Qualification Test
    qual_test = QualificationTest(
        survey=survey,
        topic="Verification Topic",
        questions=[{"question": "Q1", "options": ["A", "B"], "correctAnswer": 0}]
    )
    qual_test.save()
    print(f"Created QualificationTest ID: {qual_test.id}")

    # 3. Verify Collections
    print("\nVerifying Collections via Pymongo...")
    from pymongo import MongoClient
    client = MongoClient('mongodb://localhost:27017/')
    db = client['gleam_surveys']
    
    collections = db.list_collection_names()
    print(f"Existing collections: {collections}")
    
    if 'survey' in collections and 'qualification_test' in collections:
        print("\nSUCCESS: Both 'survey' and 'qualification_test' collections exist.")
        
        survey_count = db.survey.count_documents({'_id': survey.id})
        qual_count = db.qualification_test.count_documents({'_id': qual_test.id})
        
        print(f"Survey collection contains created doc: {survey_count == 1}")
        print(f"QualificationTest collection contains created doc: {qual_count == 1}")
        
        if survey_count == 1 and qual_count == 1:
            print("\nVERIFICATION PASSED: Data is stored in separate collections.")
            # Cleanup
            survey.delete()
            qual_test.delete()
            print("Cleanup complete.")
            return True
    else:
        print("\nFAILURE: Missing expected collections.")
        print(f"Expected 'survey' and 'qualification_test'. Found: {collections}")
        return False

if __name__ == "__main__":
    try:
        if verify():
            sys.exit(0)
        else:
            sys.exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)

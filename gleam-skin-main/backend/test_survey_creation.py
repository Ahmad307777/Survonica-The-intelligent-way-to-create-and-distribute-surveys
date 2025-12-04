"""
Test script to verify survey creation with questions saves to MongoDB
"""
import sys
import os
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gleam_backend.settings')
django.setup()

from surveys.models import Survey
from authentication.models import User

print("=" * 60)
print("TESTING SURVEY CREATION WITH QUESTIONS")
print("=" * 60)

# Get or create a test user
try:
    user = User.objects.get(username="testuser")
    print(f"\n✅ Using existing user: {user.username}")
except:
    user = User(username="testuser", email="test@example.com")
    user.set_password("password123")
    user.save()
    print(f"\n✅ Created test user: {user.username}")

# Create a survey with questions
survey_data = {
    "title": "Customer Satisfaction Survey",
    "description": "Help us improve our services",
    "questions": [
        {
            "text": "How satisfied are you with our service?",
            "type": "rating",
            "required": True,
            "options": ["1", "2", "3", "4", "5"]
        },
        {
            "text": "What is your age group?",
            "type": "multiple_choice",
            "required": True,
            "options": ["18-25", "26-35", "36-45", "46+"]
        },
        {
            "text": "Any additional comments?",
            "type": "text",
            "required": False
        }
    ]
}

print(f"\n📝 Creating survey: {survey_data['title']}")
print(f"   Questions: {len(survey_data['questions'])}")

# Create survey
survey = Survey(
    user_id=user.id,
    title=survey_data['title'],
    description=survey_data['description'],
    questions=survey_data['questions']
)
survey.save()

print(f"\n✅ Survey created with ID: {survey.id}")
print(f"   Title: {survey.title}")
print(f"   Questions saved: {len(survey.questions)}")

# Verify it's in MongoDB
retrieved_survey = Survey.objects.get(id=survey.id)
print(f"\n✅ Verified in MongoDB:")
print(f"   ID: {retrieved_survey.id}")
print(f"   Title: {retrieved_survey.title}")
print(f"   Questions: {len(retrieved_survey.questions)}")

# Print questions
print(f"\n📋 Questions:")
for i, q in enumerate(retrieved_survey.questions, 1):
    print(f"   {i}. {q['text']} ({q['type']})")
    if 'options' in q:
        print(f"      Options: {', '.join(q['options'])}")

print("\n" + "=" * 60)
print("✅ SUCCESS! Surveys with questions are saving to MongoDB")
print("=" * 60)
print("\nCheck MongoDB Compass:")
print("  Database: gleam_surveys")
print("  Collection: survey")
print(f"  Document ID: {survey.id}")

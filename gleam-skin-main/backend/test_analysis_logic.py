
import os
import sys
import json
from dotenv import load_dotenv

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gleam_backend.settings')
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from surveys.ai_helper import analyze_survey_results

def test_analysis():
    print("Testing Analysis Logic...")
    
    # Mock Data
    title = "Test Customer Satisfaction"
    questions = [
        {"id": "q1", "text": "How happy are you?", "type": "multiple_choice", "options": ["Happy", "Neutral", "Sad"]},
        {"id": "q2", "text": "Why?", "type": "text"}
    ]
    responses = [
        {"responses": {"How happy are you?": "Happy", "Why?": "Good service"}},
        {"responses": {"How happy are you?": "Happy", "Why?": "Fast shipping"}},
        {"responses": {"How happy are you?": "Sad", "Why?": "Expensive"}}
    ]
    
    # Call function
    print("Calling analyze_survey_results...")
    result = analyze_survey_results(title, questions, responses)
    
    print("\n--- Result Stats ---")
    print(json.dumps(result['stats'], indent=2))
    
    print("\n--- Question Stats ---")
    print(json.dumps(result['questionStats'], indent=2))
    
    print("\n--- AI Insights ---")
    print(json.dumps(result['aiInsights'], indent=2))

if __name__ == "__main__":
    test_analysis()


import os
import sys
from surveys.ai_helper import analyze_survey_results
from dotenv import load_dotenv

load_dotenv()

def test_single_response():
    print("--- Testing Analysis with Single Response ---")
    
    questions = [
        {"text": "What do you think of Elon Musk?", "type": "text"},
        {"text": "Rate his leadership", "type": "rating", "options": ["1", "2", "3", "4", "5"]}
    ]
    
    responses = [
        {
            "responses": {
                "q-0-123456": "He is a visionary but controversial.",
                "q-1-123456": "5"
            }
        }
    ]
    
    print("Calling analyze_survey_results...")
    result = analyze_survey_results(
        survey_title="Elon Musk Study",
        questions=questions,
        responses=responses,
        api_key=os.getenv('HUGGINGFACE_API_KEY')
    )
    
    print("\nStats check:")
    for q in result['questionStats']:
        print(f"Question: {q['question']}")
        print(f"Total Answers: {q['total_answers']}")
        if 'stats' in q:
            print(f"Stats: {q['stats']}")
        if 'sampleResponses' in q:
            print(f"Samples: {q['sampleResponses']}")

if __name__ == "__main__":
    # Add project root to path to find modules
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    # Setup Django (optional but helpful if models were needed, but here we just test the function)
    test_single_response()


import os
import sys
from dotenv import load_dotenv

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from surveys.ai_helper import generate_survey_from_conversation

load_dotenv()

def reproduce_crash():
    print("--- Simulating 'Done' Flow with Sections ---")
    
    # Simulate a conversation where user asks for sections
    conversation = [
        {"role": "assistant", "content": "Welcome! What's your survey about?"},
        {"role": "user", "content": "I want to survey employees about remote work."},
        {"role": "assistant", "content": "Do you want demographic questions?"},
        {"role": "user", "content": "Yes, standard ones."},
        {"role": "assistant", "content": "Do you want to group questions into SECTIONS (multiple pages)?"},
        {"role": "user", "content": "Yes, please create sections."},
        {"role": "assistant", "content": "Great. What specific questions?"},
        {"role": "user", "content": "Ask about productivity and equipment."},
        {"role": "assistant", "content": "Anything else?"},
        {"role": "user", "content": "No, that's it. Done."} # Trigger word usually handled by frontend, but here we test generation
    ]
    
    try:
        print("Calling generate_survey_from_conversation...")
        result = generate_survey_from_conversation(
            conversation_history=conversation,
            api_key=os.getenv('HUGGINGFACE_API_KEY')
        )
        
        print("\n[SUCCESS] Result:")
        print(f"Title: {result.get('title')}")
        print(f"Question Count: {len(result.get('questions', []))}")
        print("First 3 items:")
        for q in result.get('questions', [])[:3]:
            print(f"- Type: {q.get('type')}, Text: {q.get('text')}")
            
    except Exception as e:
        print("\n[FAIL] Crashed with error:")
        print(str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    reproduce_crash()

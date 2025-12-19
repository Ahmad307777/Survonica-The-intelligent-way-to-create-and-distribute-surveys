
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

# Load env variables
base_dir = Path(__file__).resolve().parent
env_path = base_dir / '.env'
load_dotenv(env_path)

def test_api():
    print("--- Testing Hugging Face API ---")
    
    api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not api_key:
        print("[ERROR] HUGGINGFACE_API_KEY not found in environment variables.")
        return
        
    print(f"API Key found: {api_key[:4]}...{api_key[-4:] if len(api_key)>8 else ''}")
    
    client = InferenceClient(token=api_key)
    
    try:
        print("Sending test request to meta-llama/Llama-3.2-3B-Instruct...")
        response = client.chat_completion(
            messages=[{"role": "user", "content": "Say 'Hello world'"}],
            model="meta-llama/Llama-3.2-3B-Instruct",
            max_tokens=20
        )
        print("[SUCCESS] API responded:")
        print(response.choices[0].message.content)
        
    except Exception as e:
        print(f"[FAIL] API request failed: {e}")

if __name__ == "__main__":
    test_api()

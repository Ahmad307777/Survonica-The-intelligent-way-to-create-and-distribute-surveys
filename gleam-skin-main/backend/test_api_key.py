import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('HUGGINGFACE_API_KEY')
print(f"Testing API Key: {api_key[:4]}...{api_key[-4:] if api_key else 'None'}")

if not api_key:
    print("Error: No API key found in environment.")
    exit(1)

client = InferenceClient(token=api_key)

try:
    response = client.chat_completion(
        messages=[{"role": "user", "content": "Hello"}],
        model="meta-llama/Llama-3.2-3B-Instruct",
        max_tokens=10
    )
    print("Success! Response:", response.choices[0].message.content)
except Exception as e:
    print(f"Error: {e}")

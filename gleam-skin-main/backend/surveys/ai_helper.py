import os
import json
import re
from huggingface_hub import InferenceClient

def chat_with_llama(messages: list, api_key: str = None):
    """
    Chat with Llama AI model for conversational survey generation
    
    Args:
        messages: List of chat messages [{"role": "user/assistant", "content": "..."}]
        api_key: Hugging Face API key
    
    Returns:
        Assistant's response text
    """
    if not api_key:
        api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not api_key:
        raise ValueError("Hugging Face API key not provided")
    
    client = InferenceClient(token=api_key)
    
    try:
        # Add system message to guide the AI
        system_message = {
            "role": "system",
            "content": "You are a helpful survey design assistant. Help users create effective surveys by asking clarifying questions about their goals, target audience, and what they want to learn. Be conversational and friendly."
        }
        
        # Combine system message with conversation
        full_messages = [system_message] + messages
        
        response = client.chat_completion(
            messages=full_messages,
            model="meta-llama/Llama-3.2-3B-Instruct",
            max_tokens=500,
            temperature=0.7
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"I'm having trouble connecting right now. Error: {str(e)}"

def generate_survey_from_conversation(conversation_history: list, api_key: str = None):
    """
    Generate survey questions from conversation history using AI
    
    Args:
        conversation_history: List of chat messages
        api_key: Hugging Face API key
    
    Returns:
        dict with 'title' and 'questions' list
    """
    if not api_key:
        api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not api_key:
        raise ValueError("Hugging Face API key not provided")
    
    client = InferenceClient(token=api_key)
    
    # Create a summary of the conversation
    conversation_text = "\n".join([
        f"{msg['role']}: {msg['content']}" 
        for msg in conversation_history
    ])
    
    # Create a prompt to generate the survey
    generation_prompt = f"""Based on the following conversation about a survey, generate a complete survey.
    
    CRITICAL INSTRUCTIONS:
    1. Analyze the conversation to find specific requirements (e.g., number of questions, specific topics, tone).
    2. If the user asked for a specific number of questions (e.g., "12 questions"), YOU MUST GENERATE EXACTLY THAT MANY.
    3. If no number was specified, generate between 5-10 questions.
    4. Ensure the title reflects the survey topic.

Conversation:
{conversation_text}

Generate a JSON response with this EXACT structure (no extra text):
{{
    "title": "Survey Title Here",
    "questions": [
        {{
            "text": "Question text here?",
            "type": "text",
            "required": true
        }}
    ]
}}

Question types can be: "text", "multiple_choice", "rating", "yes_no"
For multiple_choice questions, add an "options" array with 3-5 options.
Make questions clear, specific, and relevant to what was discussed.

JSON:"""
    
    try:
        messages = [
            {"role": "user", "content": generation_prompt}
        ]
        
        response = client.chat_completion(
            messages=messages,
            model="meta-llama/Llama-3.2-3B-Instruct",
            max_tokens=2500,  # Increased token limit for larger surveys
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        
        # Try to parse JSON from the response
        # Find JSON in the response (it might be wrapped in markdown code blocks)
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON object directly
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = response_text
        
        result = json.loads(json_str)
        
        # Validate the structure
        if 'title' not in result or 'questions' not in result:
            raise ValueError("Invalid response structure")
        
        return result
        
    except Exception as e:
        print(f"AI Generation Error: {str(e)}") # Log the error for debugging
        # Fallback: return a simple structure but include the error in the title to alert the user
        return {
            "title": "Generated Survey (Fallback - Error Occurred)",
            "questions": [
                {
                    "text": "We encountered an error generating your specific questions. Please try again.",
                    "type": "text",
                    "required": True
                },
                {
                    "text": f"Error details: {str(e)}",
                    "type": "text",
                    "required": False
                }
            ],
            "error": str(e)
        }

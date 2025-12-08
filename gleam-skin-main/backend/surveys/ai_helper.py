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
            max_tokens=2500,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        
        # Try to parse JSON from the response
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = response_text
        
        result = json.loads(json_str)
        
        if 'title' not in result or 'questions' not in result:
            raise ValueError("Invalid response structure")
        
        return result
        
    except Exception as e:
        print(f"AI Generation Error: {str(e)}")
        return {
            "title": "Generated Survey (Error)",
            "questions": [],
            "error": str(e)
        }

def detect_duplicate_questions(questions: list, api_key: str = None):
    """
    Detect duplicate/redundant questions using AI semantic similarity
    
    Args:
        questions: List of question dicts [{"text": "...", "type": "...", "options": [...]}]
        api_key: Hugging Face API key
    
    Returns:
        {
            "duplicates": [[idx1, idx2], ...],
            "suggestions": [...],
            "total_duplicates": int
        }
    """
    if not api_key:
        api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not api_key:
        raise ValueError("Hugging Face API key not provided")
    
    client = InferenceClient(token=api_key)
    
    try:
        question_texts = [q.get('text', '') for q in questions]
        
        prompt = f"""Analyze these survey questions and identify which ones are asking essentially the same thing (duplicates/redundant).

Questions:
{chr(10).join([f"{i+1}. {q}" for i, q in enumerate(question_texts)])}

For each pair of duplicate questions, respond in this exact JSON format:
{{
  "duplicates": [
    {{
      "indices": [0, 3],
      "similarity": 0.95,
      "reason": "Both ask about age"
    }}
  ]
}}

Only include pairs that are truly asking the same thing. If no duplicates, return {{"duplicates": []}}.
Response (JSON only):"""

        response = client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model="meta-llama/Llama-3.2-3B-Instruct",
            max_tokens=1000,
            temperature=0.3
        )
        
        response_text = response.choices[0].message.content.strip()
        
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            duplicates_data = result.get('duplicates', [])
            
            duplicate_pairs = []
            suggestions = []
            
            for dup in duplicates_data:
                indices = dup.get('indices', [])
                if len(indices) >= 2:
                    duplicate_pairs.append(indices)
                    suggestions.append({
                        'indices': indices,
                        'questions': [question_texts[i] for i in indices if i < len(question_texts)],
                        'similarity': dup.get('similarity', 0.9),
                        'suggestion': f"These questions appear to ask the same thing: {dup.get('reason', 'similar meaning')}"
                    })
            
            return {
                'duplicates': duplicate_pairs,
                'suggestions': suggestions,
                'total_duplicates': len(duplicate_pairs)
            }
        else:
            return {
                'duplicates': [],
                'suggestions': [],
                'total_duplicates': 0
            }
            
    except Exception as e:
        print(f"Error detecting duplicates: {e}")
        return {
            'duplicates': [],
            'suggestions': [],
            'error': str(e),
            'total_duplicates': 0
        }

def generate_options_for_question(question_text: str, api_key: str = None):
    """
    Generate multiple-choice options for a survey question using AI
    
    Args:
        question_text: The question to generate options for
        api_key: Hugging Face API key
    
    Returns:
        { "options": ["Option 1", "Option 2", ...] }
    """
    if not api_key:
        api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not api_key:
        raise ValueError("Hugging Face API key not provided")
    
    client = InferenceClient(token=api_key)
    
    try:
        prompt = f"""Generate 5 likely multiple-choice options for this survey question:
"{question_text}"

Return a JSON object with a single key "options" containing a list of strings.
Example: {{ "options": ["Satisfied", "Neutral", "Dissatisfied"] }}

JSON Only:"""

        response = client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model="meta-llama/Llama-3.2-3B-Instruct",
            max_tokens=200,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Parse JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            return result
        else:
            # Fallback primitive parsing if JSON fails
            lines = [l.strip('- ').strip() for l in response_text.split('\n') if l.strip()]
            return { "options": lines[:5] }
            
    except Exception as e:
        print(f"Error generating options: {e}")
        return { "options": [], "error": str(e) }

def generate_image_from_text(prompt: str, api_key: str = None):
    """
    Generate an image from text using Stable Diffusion via Hugging Face
    
    Args:
        prompt: The text prompt for image generation
        api_key: Hugging Face API key
    
    Returns:
        { "image": "data:image/png;base64,..." }
    """
    import base64
    from io import BytesIO
    
    if not api_key:
        api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    if not api_key:
        raise ValueError("Hugging Face API key not provided")
    
    # Use default model (Best available free option)
    client = InferenceClient(token=api_key)
    
    try:
        # Generate image
        image = client.text_to_image(prompt)
        
        # Convert to Base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return { "image": f"data:image/png;base64,{img_str}" }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error generating image: {e}")
        return { "image": None, "error": str(e) }

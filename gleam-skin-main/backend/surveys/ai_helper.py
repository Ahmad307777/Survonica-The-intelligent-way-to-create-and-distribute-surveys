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
            "content": "You are a helpful survey design assistant. Clarify goals and audience. ASK: 1. Do you want standard demographics? 2. Do you want to group questions into SECTIONS (multiple pages) or keep it as one page? Be conversational."
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
    5. DEMOGRAPHICS RULE: Check if the user wanted demographic questions (Age, Gender, etc.) in the conversation.
       - If YES: Include 2-3 standard demographic questions at the start.
       - If NO or NOT MENTIONED: Do NOT include them. Focus strictly on the topic.
    6. TONE RULE: Ensure all questions are Neutral, Unbiased, and Professional. Avoid leading questions (e.g., "Don't you love X?"). Use "How would you rate X?" instead.

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

Question types can be: "text", "multiple_choice", "rating", "yes_no", "section_header"
For "section_header", the "text" field is the Title of the section.
For multiple_choice questions, add an "options" array with 3-5 options.
SECTIONING RULE: Check if the user asked for sections/pages.
   - If YES: Insert {{ "type": "section_header", "text": "Section Name" }} before groups of related questions.
   - If NO: Do not use section_header.

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
        json_str = ""
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Fallback: Find the first { and the last }
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}')
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx+1]
            else:
                json_str = response_text
        
        # Cleanup: Remove comments // ...
        json_str = re.sub(r'//.*$', '', json_str, flags=re.MULTILINE)
        
        try:
            result = json.loads(json_str)
        except json.JSONDecodeError:
            # Last resort: try to remove trailing commas (naive regex)
            json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
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

def analyze_survey_results(survey_title: str, questions: list, responses: list, api_key: str = None):
    """
    Analyze survey results using AI to generate comprehensive insights and reports.
    
    Args:
        survey_title: Title of the survey
        questions: List of question dicts
        responses: List of response dicts
        api_key: Hugging Face API key
    
    Returns:
        dict containing stats, aggregated_data, and ai_insights
    """
    if not api_key:
        api_key = os.getenv('HUGGINGFACE_API_KEY')
    
    # 1. Aggregate Data
    total_responses = len(responses)
    question_stats = []
    
    # Text summary for AI
    text_summary_for_ai = f"Survey Title: {survey_title}\nTotal Responses: {total_responses}\n\n"
    
    for idx, q in enumerate(questions):
        q_id = str(q.get('id', '')) # Assuming questions have IDs or we match by text if needed
        q_text = q.get('text', '')
        q_type = q.get('type', 'text')
        q_options = q.get('options', [])
        
        # Extract answers for this question
        answers = []
        for r in responses:
            # responses structure: {'question_text': 'answer'} or based on ID
            # Based on models.py, SurveyResponse.responses is a DictField. 
            # It usually maps question_id/text -> answer. 
            # Let's assume it keys by question text based on typical mongo usage or we try both.
            # Try 3 strategies to find the answer:
            # 1. Exact text match
            # 2. ID match
            # 3. Index match (common in this frontend: q-{index}-{timestamp})
            
            resp_dict = r.get('responses', {})
            val = resp_dict.get(q_text) or resp_dict.get(q_id)
            
            if not val:
                # Try index match
                prefix = f"q-{idx}-"
                for k, v in resp_dict.items():
                    if k.startswith(prefix):
                        val = v
                        break
            
            if val:
                answers.append(val)
        
        stat = {
            'question': q_text,
            'type': q_type,
            'total_answers': len(answers)
        }
        
        if q_type in ['multiple_choice', 'rating', 'yes_no', 'dropdown']:
            # Count frequencies
            counts = {}
            for opt in q_options:
                counts[opt] = 0
            
            # Also handle answers not in options (custom)
            for a in answers:
                counts[a] = counts.get(a, 0) + 1
                
            stats_list = []
            for k, v in counts.items():
                stats_list.append({
                    'option': k,
                    'count': v,
                    'percentage': round((v / len(answers) * 100)) if len(answers) > 0 else 0
                })
            
            stat['stats'] = stats_list
            text_summary_for_ai += f"Question: {q_text}\nResults: {json.dumps(stats_list)}\n\n"
            
        else:
            # Text analysis
            stat['sampleResponses'] = answers[:5] # Send top 5 to frontend
            # Send all to AI (truncated if too long)
            joined_answers = "; ".join([str(a) for a in answers[:20]]) # Limit to 20 text responses for prompt size
            text_summary_for_ai += f"Question: {q_text}\nText Responses: {joined_answers}\n\n"
            
        question_stats.append(stat)

    # 2. AI Analysis
    ai_insights = None
    
    if api_key and total_responses > 0:
        client = InferenceClient(token=api_key)
        
        prompt = f"""You are an expert data analyst. Analyze these survey results deeply and generate a comprehensive report.

DATA:
{text_summary_for_ai}

REQUIREMENTS:
1. Sentiment Analysis: Determine overall positive/neutral/negative sentiment percentage (must sum to 100).
2. Key Insights: Identify 3-5 distinct, non-obvious patterns or trends.
3. Improvement Suggestions: Give 3-5 actionable recommendations based on the data.
4. Executive Summary: A professional paragraph summarizing the entire survey outcome.
5. Keywords: Extract 5-7 accurate keywords representing the main themes.

OUTPUT FORMAT (JSON ONLY):
{{
  "sentiment": {{ "positive": 0, "neutral": 0, "negative": 0 }},
  "keyInsights": ["User satisfaction is correlated with...", "Most requests are for..."],
  "improvementSuggestions": ["Focus marketing on...", "Improve the login flow..."],
  "keywords": ["Efficiency", "UX", "Pricing"],
  "executiveSummary": "The survey results indicate a strong market fit..."
}}

JSON RESPONSE:"""

        try:
            response = client.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a senior data analyst. Output valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                model="meta-llama/Llama-3.2-3B-Instruct",
                max_tokens=2000, 
                temperature=0.5
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Robust JSON extraction
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                json_str = json_match.group(0) if json_match else response_text
                
            ai_insights = json.loads(json_str)
            
        except Exception as e:
            print(f"AI Analysis Error: {e}")
            # Fallback if AI fails
            ai_insights = {
                "sentiment": { "positive": 0, "neutral": 100, "negative": 0 },
                "keyInsights": [f"AI Analysis failed: {str(e)}"],
                "improvementSuggestions": [],
                "keywords": [],
                "executiveSummary": "Automated analysis was unavailable."
            }
            
    return {
        "questionStats": question_stats,
        "aiInsights": ai_insights,
        "stats": {
            "totalResponses": total_responses,
            "completionRate": 100, 
        }
    }

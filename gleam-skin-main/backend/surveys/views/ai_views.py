from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def chat_with_ai(request):
    """
    Chat with Llama AI for conversational survey generation
    Expects: { "messages": [...], "api_key": "..." }
    Returns: { "response": "..." }
    """
    from ..ai_helper import chat_with_llama
    
    messages = request.data.get('messages', [])
    api_key = request.data.get('api_key')
    
    if not messages:
        return Response({'detail': 'Messages are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        response_text = chat_with_llama(messages, api_key)
        return Response({'response': response_text})
    except Exception as e:
        return Response({'detail': str(e), 'error': True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def generate_survey_from_chat(request):
    """
    Generate survey from conversation history
    Expects: { "conversation": [...], "api_key": "..." }
    Returns: { "title": "...", "questions": [...] }
    """
    from ..ai_helper import generate_survey_from_conversation
    
    conversation = request.data.get('conversation', [])
    api_key = request.data.get('api_key')
    
    if not conversation:
        return Response({'detail': 'Conversation history is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        result = generate_survey_from_conversation(conversation, api_key)
        return Response(result)
    except Exception as e:
        return Response({'detail': str(e), 'error': True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def detect_redundancy(request):
    """
    Detect redundant/duplicate questions using AI
    Expects: { "questions": [{"text": "...", "type": "...", "options": [...]}] }
    Returns: { "duplicates": [[idx1, idx2], ...], "suggestions": [...] }
    """
    from ..ai_helper import detect_duplicate_questions
    
    questions = request.data.get('questions', [])
    
    if not questions or len(questions) < 2:
        return Response({
            'duplicates': [],
            'suggestions': [],
            'message': 'Need at least 2 questions to check for duplicates'
        })
    
    try:
        result = detect_duplicate_questions(questions)
        return Response(result)
    except Exception as e:
        return Response({'detail': str(e), 'error': True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def generate_options(request):
    """
    Generate multiple choice options for a question
    Expects: { "question": "..." }
    Returns: { "options": [...] }
    """
    from ..ai_helper import generate_options_for_question
    
    question = request.data.get('question')
    api_key = request.data.get('api_key')
    
    if not question:
        return Response({'detail': 'Question text is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        result = generate_options_for_question(question, api_key)
        return Response(result)
    except Exception as e:
        return Response({'detail': str(e), 'error': True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def generate_image_view(request):
    """
    Generate an image from text
    Expects: { "prompt": "..." }
    Returns: { "image": "data:image/png;base64,..." }
    """
    from ..ai_helper import generate_image_from_text
    
    prompt = request.data.get('prompt')
    api_key = request.data.get('api_key')
    
    if not prompt:
        return Response({'detail': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        result = generate_image_from_text(prompt, api_key)
        return Response(result)
    except Exception as e:
        return Response({'detail': str(e), 'error': True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])
def analyze_survey_view(request):
    """
    Analyze survey results
    Expects: { "surveyId": "..." }
    Returns: JSON analysis results
    """
    from ..ai_helper import analyze_survey_results
    from ..models import Survey, SurveyResponse
    
    survey_id = request.data.get('surveyId')
    api_key = request.data.get('api_key') # Optional override
    
    if not survey_id:
        return Response({'detail': 'Survey ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Fetch Survey
        try:
            survey = Survey.objects.get(id=survey_id)
            # MongoEngine compatible fetch:
            # survey = Survey.objects.get(id=survey_id) 
            # Note: models.py uses mongoengine 'Document', so objects.get works.
        except Exception:
            # Try to fetch by checking if it's a valid objectid string if needed, 
            # or usually mongoengine handles it. 
            return Response({'detail': 'Survey not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Fetch Responses
        responses = SurveyResponse.objects.filter(survey=survey)
        
        # Convert to list of dicts/objects that helper expects
        # The helper expects lists of dict-like objects or we can pass doc objects if helper handles them.
        # Check helper: 
        # q.get('text') -> implies dict interface.
        # r.get('responses') -> implies dict interface.
        # MongoEngine objects allow .to_mongo() but simpler to just build dicts.
        
        survey_title = survey.title
        questions_data = survey.questions # ListField(DictField()) -> already list of dicts
        
        responses_data = []
        for r in responses:
            responses_data.append({
                'responses': r.responses, # DictField -> dict
                'completed_at': r.completed_at
            })
            
        result = analyze_survey_results(survey_title, questions_data, responses_data, api_key)
        return Response(result)
        
    except Exception as e:
        print(f"Error analyzing survey: {e}")
        return Response({'detail': str(e), 'error': True}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

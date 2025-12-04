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

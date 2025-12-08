from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SurveyViewSet, QualificationTestViewSet, SurveyResponseViewSet, 
    RespondentQualificationViewSet, chat_with_ai, generate_survey_from_chat, detect_redundancy,
    generate_options, generate_image_view
)

router = DefaultRouter()
router.register(r'surveys', SurveyViewSet, basename='survey')
router.register(r'qualification-tests', QualificationTestViewSet, basename='qualificationtest')
router.register(r'survey-responses', SurveyResponseViewSet, basename='surveyresponse')
router.register(r'respondent-qualifications', RespondentQualificationViewSet, basename='respondentqualification')

urlpatterns = [
    path('', include(router.urls)),
    path('ai/chat/', chat_with_ai, name='chat-with-ai'),
    path('ai/generate-from-chat/', generate_survey_from_chat, name='generate-from-chat'),
    path('ai/detect-redundancy/', detect_redundancy, name='detect-redundancy'),
    path('ai/generate-options/', generate_options, name='generate-options'),
    path('ai/generate-image/', generate_image_view, name='generate-image'),
]

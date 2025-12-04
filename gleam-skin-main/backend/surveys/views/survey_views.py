from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from ..models import Survey, QualificationTest, SurveyResponse, RespondentQualification
from ..serializers import SurveySerializer, QualificationTestSerializer, SurveyResponseSerializer, RespondentQualificationSerializer
from mongoengine.errors import DoesNotExist

class MongoEngineViewSet(viewsets.ViewSet):
    """Base ViewSet for MongoEngine documents"""
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        print("=" * 50)
        print("SURVEY CREATE REQUEST")
        print(f"Data: {request.data}")
        print(f"Session user_id: {request.session.get('user_id')}")
        print("=" * 50)
        
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                self.perform_create(serializer)
                print(f"✅ Survey created successfully: {serializer.data}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"❌ Error creating survey: {type(e).__name__}: {e}")
                return Response({
                    'detail': f'Error creating survey: {str(e)}',
                    'error': True
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print(f"❌ Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            instance = self.get_queryset().get(id=pk)
            serializer = self.serializer_class(instance)
            return Response(serializer.data)
        except DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        try:
            instance = self.get_queryset().get(id=pk)
            serializer = self.serializer_class(instance, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        try:
            instance = self.get_queryset().get(id=pk)
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        serializer.save()

class SurveyViewSet(MongoEngineViewSet):
    """Survey CRUD operations"""
    serializer_class = SurveySerializer
    permission_classes = [permissions.AllowAny]  # Allow any for now

    def get_queryset(self):
        return Survey.objects.all()

    def perform_create(self, serializer):
        # Get user_id from session (MongoDB auth)
        user_id = self.request.session.get('user_id')
        if not user_id:
            # Fallback to Django user if available
            user_id = self.request.user.id if hasattr(self.request.user, 'id') else None
        
        if user_id:
            serializer.save(user_id=int(user_id) if isinstance(user_id, str) else user_id)
        else:
            serializer.save(user_id=0)  # Anonymous user

class QualificationTestViewSet(MongoEngineViewSet):
    """Qualification Test CRUD operations"""
    serializer_class = QualificationTestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = QualificationTest.objects.all()
        survey_id = self.request.query_params.get('survey')
        if survey_id:
            try:
                survey = Survey.objects.get(id=survey_id)
                queryset = queryset.filter(survey=survey)
            except DoesNotExist:
                return QualificationTest.objects.none()
        return queryset

class SurveyResponseViewSet(MongoEngineViewSet):
    """Survey Response CRUD operations"""
    serializer_class = SurveyResponseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return SurveyResponse.objects.all()

class RespondentQualificationViewSet(MongoEngineViewSet):
    """Respondent Qualification CRUD operations"""
    serializer_class = RespondentQualificationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return RespondentQualification.objects.all()

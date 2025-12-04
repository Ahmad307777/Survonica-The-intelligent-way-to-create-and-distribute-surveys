from rest_framework import serializers
from .models import Survey, QualificationTest, SurveyResponse, RespondentQualification

class MongoEngineSerializer(serializers.Serializer):
    """Base serializer for MongoEngine documents"""
    id = serializers.CharField(read_only=True)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['id'] = str(instance.id)
        return data

class SurveySerializer(MongoEngineSerializer):
    user_id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    template = serializers.CharField(max_length=255, required=False, allow_blank=True)
    questions = serializers.ListField(child=serializers.DictField(), required=False)
    require_qualification = serializers.BooleanField(default=False)
    qualification_pass_score = serializers.IntegerField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        return Survey(**validated_data).save()

    def update(self, instance, validated_data):
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

class QualificationTestSerializer(MongoEngineSerializer):
    survey_id = serializers.CharField(write_only=True, required=False)
    survey = serializers.SerializerMethodField(read_only=True)
    topic = serializers.CharField(max_length=255)
    questions = serializers.ListField(child=serializers.DictField())
    created_at = serializers.DateTimeField(read_only=True)

    def get_survey(self, obj):
        return str(obj.survey.id) if obj.survey else None

    def create(self, validated_data):
        survey_id = validated_data.pop('survey_id', None)
        if survey_id:
            try:
                survey = Survey.objects.get(id=survey_id)
                validated_data['survey'] = survey
            except Survey.DoesNotExist:
                raise serializers.ValidationError({'survey_id': 'Survey not found'})
        return QualificationTest(**validated_data).save()

    def update(self, instance, validated_data):
        survey_id = validated_data.pop('survey_id', None)
        if survey_id:
            try:
                survey = Survey.objects.get(id=survey_id)
                instance.survey = survey
            except Survey.DoesNotExist:
                raise serializers.ValidationError({'survey_id': 'Survey not found'})
        
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

class SurveyResponseSerializer(MongoEngineSerializer):
    survey_id = serializers.CharField(write_only=True)
    respondent_email = serializers.EmailField()
    responses = serializers.DictField()
    completed_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        survey_id = validated_data.pop('survey_id')
        survey = Survey.objects.get(id=survey_id)
        return SurveyResponse(survey=survey, **validated_data).save()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['survey'] = str(instance.survey.id) if instance.survey else None
        return data

class RespondentQualificationSerializer(MongoEngineSerializer):
    survey_id = serializers.CharField(write_only=True)
    respondent_email = serializers.EmailField()
    qualification_name = serializers.CharField(max_length=255)
    score = serializers.IntegerField()
    passed = serializers.BooleanField()
    created_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        survey_id = validated_data.pop('survey_id')
        survey = Survey.objects.get(id=survey_id)
        return RespondentQualification(survey=survey, **validated_data).save()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['survey'] = str(instance.survey.id) if instance.survey else None
        return data

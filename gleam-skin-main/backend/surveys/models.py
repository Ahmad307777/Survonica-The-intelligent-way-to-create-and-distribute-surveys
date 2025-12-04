from mongoengine import Document, StringField, ListField, BooleanField, IntField, DateTimeField, DictField, ReferenceField, EmailField
import datetime

class Survey(Document):
    user_id = StringField(required=True)  # Store MongoDB User ID (ObjectId as string)
    title = StringField(max_length=255, required=True)
    description = StringField()
    template = StringField(max_length=255)
    questions = ListField(DictField())  # List of question dictionaries
    require_qualification = BooleanField(default=False)
    qualification_pass_score = IntField()
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(Survey, self).save(*args, **kwargs)

    def __str__(self):
        return self.title

class QualificationTest(Document):
    survey = ReferenceField(Survey, reverse_delete_rule=2) # 2 = CASCADE
    topic = StringField(max_length=255, required=True)
    questions = ListField(DictField())
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    def __str__(self):
        return f"Test for {self.survey.title}"

class SurveyResponse(Document):
    survey = ReferenceField(Survey, reverse_delete_rule=2)
    respondent_email = EmailField(required=True)
    responses = DictField(default=dict)
    completed_at = DateTimeField(default=datetime.datetime.utcnow)

    def __str__(self):
        return f"Response to {self.survey.title} by {self.respondent_email}"

class RespondentQualification(Document):
    survey = ReferenceField(Survey, reverse_delete_rule=2)
    respondent_email = EmailField(required=True)
    qualification_name = StringField(max_length=255)
    score = IntField(required=True)
    passed = BooleanField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    def __str__(self):
        return f"{self.respondent_email} - {self.qualification_name} ({'Passed' if self.passed else 'Failed'})"

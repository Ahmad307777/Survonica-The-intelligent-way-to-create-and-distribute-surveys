from mongoengine import Document, StringField, EmailField, DateTimeField, BooleanField
import bcrypt
import datetime

class User(Document):
    """MongoDB User model with password hashing"""
    username = StringField(required=True, unique=True, max_length=150)
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    is_active = BooleanField(default=True)
    is_staff = BooleanField(default=False)
    is_superuser = BooleanField(default=False)
    date_joined = DateTimeField(default=datetime.datetime.utcnow)
    last_login = DateTimeField()
    
    meta = {
        'collection': 'users',
        'indexes': ['username', 'email']
    }
    
    def set_password(self, raw_password):
        """Hash and set the password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, raw_password):
        """Check if the provided password matches the hash"""
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.datetime.utcnow()
        self.save()
    
    def __str__(self):
        return self.username
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False

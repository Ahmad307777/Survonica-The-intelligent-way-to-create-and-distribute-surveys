from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .models import User
from mongoengine.errors import NotUniqueError, DoesNotExist
import re

def validate_email(email):
    """Simple email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint with MongoDB"""
    try:
        data = request.data if request.content_type == 'application/json' else request.POST
        
        username = data.get('username', '').strip() or data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return Response({
                'detail': 'Username/email and password are required',
                'error': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to find user by username or email
        try:
            user = User.objects.get(username=username)
        except DoesNotExist:
            try:
                user = User.objects.get(email=username)
            except DoesNotExist:
                return Response({
                    'detail': 'Invalid credentials',
                    'error': True
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check password
        if not user.check_password(password):
            return Response({
                'detail': 'Invalid credentials',
                'error': True
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Update last login
        user.update_last_login()
        
        # Store user ID in session
        request.session['user_id'] = str(user.id)
        request.session['username'] = user.username
        
        return Response({
            'detail': 'Logged in successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email
            }
        })
    except Exception as e:
        return Response({
            'detail': f'Login error: {str(e)}',
            'error': True
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """User registration endpoint with MongoDB"""
    try:
        # Debug logging (don't read request.body as it consumes the stream)
        print("=" * 50)
        print("REGISTRATION REQUEST")
        print(f"Content-Type: {request.content_type}")
        print(f"Request Data: {request.data}")
        print("=" * 50)
        
        data = request.data if request.content_type == 'application/json' else request.POST
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        print(f"Parsed - Username: '{username}', Email: '{email}', Password: '***'")
        
        # Validation
        errors = {}
        if not username:
            errors['username'] = 'Username is required'
        elif len(username) < 3:
            errors['username'] = 'Username must be at least 3 characters'
        
        if not email:
            errors['email'] = 'Email is required'
        elif not validate_email(email):
            errors['email'] = 'Invalid email format'
        
        if not password:
            errors['password'] = 'Password is required'
        elif len(password) < 6:
            errors['password'] = 'Password must be at least 6 characters'
        
        if errors:
            print(f"Validation Errors: {errors}")
            return Response({
                'detail': 'Validation failed',
                'errors': errors,
                'error': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if username or email exists
        if User.objects(username=username).first():
            return Response({
                'detail': 'Username already exists',
                'error': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects(email=email).first():
            return Response({
                'detail': 'Email already exists',
                'error': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User(username=username, email=email)
        user.set_password(password)
        user.save()
        
        # Store user ID in session
        request.session['user_id'] = str(user.id)
        request.session['username'] = user.username
        
        return Response({
            'detail': 'Registered and logged in successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)
    except NotUniqueError:
        return Response({
            'detail': 'Username or email already exists',
            'error': True
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'detail': f'Registration error: {str(e)}',
            'error': True
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout_view(request):
    """User logout endpoint"""
    try:
        request.session.flush()
        return Response({'detail': 'Logged out successfully'})
    except Exception as e:
        return Response({
            'detail': f'Logout error: {str(e)}',
            'error': True
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def user_view(request):
    """Get current user info"""
    try:
        user_id = request.session.get('user_id')
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                return Response({
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'email': user.email
                    }
                })
            except DoesNotExist:
                request.session.flush()
                return Response({'user': None})
        return Response({'user': None})
    except Exception as e:
        return Response({
            'detail': f'Error: {str(e)}',
            'error': True
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

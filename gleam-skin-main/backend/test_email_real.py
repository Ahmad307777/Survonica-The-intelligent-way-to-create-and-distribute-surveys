
import os
import django
from django.conf import settings
from django.core.mail import send_mail
import sys
from dotenv import load_dotenv

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gleam_backend.settings')
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'), override=True)

django.setup()

def test_email():
    print("Testing Email Configuration...")
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    print(f"Checking for .env at: {env_path}")
    print(f"File exists: {os.path.exists(env_path)}")
    
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            print(f"Content preview: {f.read(50)}...")

    # Force reload
    load_dotenv(env_path, override=True)
    
    print(f"Env EMAIL_HOST_USER: '{os.getenv('EMAIL_HOST_USER')}'")
    print(f"Settings EMAIL_HOST_USER: '{settings.EMAIL_HOST_USER}'")
    print(f"Settings EMAIL_BACKEND: '{settings.EMAIL_BACKEND}'")
    
    user = os.getenv('EMAIL_HOST_USER') or settings.EMAIL_HOST_USER
    if not user:
        print("CRITICAL: EMAIL_HOST_USER is empty! Env failed to load.")
        return

    try:
        print(f"Attempting to send test email as {user}...")
        send_mail(
            'Test Email from Survonica Debugger',
            'This is a test email to verify SMTP settings.',
            user, 
            [user], 
            fail_silently=False,
        )
        print("SUCCESS: Email sent successfully!")
    except Exception as e:
        print("\nFAILURE: Could not send email.")
        print("-" * 50)
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        print("-" * 50)

if __name__ == "__main__":
    test_email()

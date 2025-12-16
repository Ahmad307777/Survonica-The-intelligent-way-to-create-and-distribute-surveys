
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Sends a test email to verify SMTP configuration'

    def handle(self, *args, **kwargs):
        self.stdout.write("Checking Email Configuration...")
        self.stdout.write(f"EMAIL_HOST_USER from settings: '{settings.EMAIL_HOST_USER}'")
        self.stdout.write(f"EMAIL_BACKEND: '{settings.EMAIL_BACKEND}'")
        
        if not settings.EMAIL_HOST_USER:
            self.stdout.write(self.style.ERROR("CRITICAL: EMAIL_HOST_USER is empty. Env not loaded?"))
            return

        try:
            self.stdout.write(f"Attempting to send email to {settings.EMAIL_HOST_USER}...")
            send_mail(
                'Django Management Command Test',
                'If you are reading this, the Django email system is working correctly.',
                settings.EMAIL_HOST_USER,
                [settings.EMAIL_HOST_USER],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS('Successfully sent test email.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to send email: {e}'))

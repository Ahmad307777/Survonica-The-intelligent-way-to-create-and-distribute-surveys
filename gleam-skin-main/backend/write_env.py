
import os

content = """EMAIL_HOST_USER=s3327066437@gmail.com
EMAIL_HOST_PASSWORD=kxmimmqhzckxcrec
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
MONGO_URI=mongodb+srv://bscs22f37_db_user:wWJj2RlIisPUTgLO@survonica.adbiwjm.mongodb.net/gleam_surveys?appName=Survonica
HUGGINGFACE_API_KEY=YOUR_HUGGINGFACE_API_KEY
"""

file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully wrote .env to {file_path}")

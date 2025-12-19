
import os

content = """EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
MONGO_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/your_db?appName=Survonica
HUGGINGFACE_API_KEY=your_hf_key_here
"""

file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully wrote .env to {file_path}")

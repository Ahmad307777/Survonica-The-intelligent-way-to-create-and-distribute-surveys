# Survonica - Intelligent Survey Platform

## Project info

**Description**: AI-powered survey creation platform that automates survey design, detects redundant questions, and creates beautiful, engaging surveys in minutes.

## Getting Started

To work locally with this project, follow these steps:

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## Quick Start Guide (For New Machines)

Follow these exact commands to get the project running on a new computer.

### 1. Clone & Frontend Setup
```sh
# Clone the repository
git clone https://github.com/Ahmad307777/Survonica-The-intelligent-way-to-create-and-distribute-surveys.git
cd Survonica-The-intelligent-way-to-create-and-distribute-surveys

# Install and start Frontend
npm install
npm run dev
```
Frontend: `http://localhost:8080`

### 2. Backend Setup
```sh
# Enter backend directory
cd backend

# Create & Activate Virtual Environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Backend Dependencies
pip install -r requirements.txt

# Create Database Tables
python manage.py migrate

# Start Backend Server
python manage.py runserver
```
Backend: `http://localhost:8000`

### 3. Environment Setup (.env)
You **MUST** create a `.env` file in the `backend/` folder. Use this command to create it quickly:

**Windows (PowerShell):**
```powershell
echo "EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
MONGO_URI=your_mongodb_atlas_uri
HUGGINGFACE_API_KEY=your_hf_api_key" > .env
```

## Technologies Used
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide Icons, Shadcn UI.
- **Backend**: Django, Django Rest Framework, Mongoengine (MongoDB Atlas).
- **AI**: Llama 3.1 (Hugging Face API) & Voice Input (Web Speech API).

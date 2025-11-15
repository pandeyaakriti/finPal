# FinPal Repo

## Setup

### Frontend
cd frontend
npm install
npm run dev

### Backend
cd backend
npm install
npm run dev

### AI service
cd ai/service
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

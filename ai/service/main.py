from fastapi import FastAPI

app = FastAPI(title="FinPal AI Service")

@app.get("/")
def root():
    return {"message": "AI service running!"}

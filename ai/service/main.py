from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict

app = FastAPI()

class Input(BaseModel):
    text: str

class Output(BaseModel):
    label: int

@app.post("/predict", response_model=Output)
async def predict_text(data: Input):
    label = predict(data.text)
    return {"label": label}

#ai/app.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from predict import predict, predict_batch

app = FastAPI()

class PredictRequest(BaseModel):
    text: str

class BatchRequest(BaseModel):
    transactions: List[dict]

@app.post("/predict")
def single(req: PredictRequest):
    result = predict(req.text)
    return {
        "prediction": result["category"],
        "confidence": result["confidence"]
    }

@app.post("/batch-predict")
def batch(req: BatchRequest):
    texts = [t["text"] for t in req.transactions]
    results = predict_batch(texts)

    return [
        {
            "prediction": r["category"],
            "confidence": r["confidence"]
        }
        for r in results
    ]

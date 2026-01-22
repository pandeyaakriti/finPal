# ai/api.py
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
from huggingface_hub import login
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

# HuggingFace login
login(os.getenv("HF_TOKEN"))
MODEL_ID = os.getenv("MODEL_ID")

tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_ID, use_auth_token=True)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_ID, use_auth_token=True)

# FastAPI app
app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(req: TextRequest):
    inputs = tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    prediction = int(outputs.logits.argmax(-1))
    return {"prediction": prediction}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

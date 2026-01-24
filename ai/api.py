# ai/api.py
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import DistilBertForSequenceClassification, DistilBertTokenizerFast
from huggingface_hub import login
import os
import uvicorn
from dotenv import load_dotenv
import torch
import torch.nn.functional as F

load_dotenv()

# HuggingFace login
login(os.getenv("HF_TOKEN"))
MODEL_ID = os.getenv("MODEL_ID")

tokenizer = DistilBertTokenizerFast.from_pretrained(
    MODEL_ID,
    token=os.getenv("HF_TOKEN")
)

model = DistilBertForSequenceClassification.from_pretrained(
    MODEL_ID,
    token=os.getenv("HF_TOKEN")
)

model.eval()

# FastAPI app
app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(req: TextRequest):
    inputs = tokenizer(req.text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)

    label = int(probs.argmax(dim=-1))
    confidence = float(probs.max())

    return {
    "prediction": label,
    "label": label,
    "confidence": confidence
}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

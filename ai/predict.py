import torch
import json
import torch.nn.functional as F
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

# Load label map
with open("label_map.json") as f:
    maps = json.load(f)

id2label = {int(k): v for k, v in maps["id2label"].items()}

# Load model & tokenizer
tokenizer = DistilBertTokenizerFast.from_pretrained("./model")
model = DistilBertForSequenceClassification.from_pretrained("./model")
model.eval()

def predict(text):
    inputs = tokenizer(
        text.lower().strip(),
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=64
    )

    with torch.no_grad():
        outputs = model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)
    confidence, predicted_id = torch.max(probs, dim=1)

    return {
        "category": id2label[predicted_id.item()],
        "confidence": round(confidence.item(), 3)
    }

# Test
if __name__ == "__main__":
    test_text = "apple for breakfast"
    print(predict(test_text))

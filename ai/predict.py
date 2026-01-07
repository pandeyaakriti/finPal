import torch
import json
import re
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch.nn.functional as F

MODEL_PATH = "./model"

# Load mapping
with open("label_map.json", "r") as f:
    maps = json.load(f)

id2label = {int(k): v for k, v in maps["id2label"].items()}
label2id = {v: int(k) for k, v in maps["id2label"].items()}

# Load model + tokenizer
tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_PATH)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

print(f"Model loaded on: {device}")
print(f"Available categories: {list(id2label.values())}\n")


def preprocess_text(text):
    """Preprocess text same as training"""
    text = str(text).strip()
    text = re.sub(r'\s+', ' ', text)
    return text


def predict(text, top_k=3):
    """
    Predict category for given transaction remark
    
    Args:
        text: Transaction remark/description
        top_k: Number of top predictions to return
    
    Returns:
        dict with primary prediction and top-k predictions
    """
    # Preprocess
    text = preprocess_text(text)
    
    # Tokenize
    inputs = tokenizer(
        text, 
        return_tensors="pt", 
        truncation=True, 
        padding="max_length", 
        max_length=128
    )
    
    # Move to device
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Predict
    with torch.no_grad():
        logits = model(**inputs).logits
    
    # Get probabilities
    probs = F.softmax(logits, dim=-1)[0]
    
    # Get top-k predictions
    top_probs, top_indices = torch.topk(probs, min(top_k, len(id2label)))
    
    # Primary prediction
    pred_id = top_indices[0].item()
    confidence = top_probs[0].item()
    
    # Build top-k predictions
    top_predictions = [
        {
            "category": id2label[idx.item()],
            "confidence": float(prob.item())
        }
        for prob, idx in zip(top_probs, top_indices)
    ]
    
    # Confidence level interpretation
    if confidence >= 0.7:
        confidence_level = "high"
    elif confidence >= 0.4:
        confidence_level = "medium"
    else:
        confidence_level = "low"
    
    return {
        "text": text,
        "category": id2label[pred_id],
        "confidence": float(confidence),
        "confidence_level": confidence_level,
        "top_predictions": top_predictions
    }


def predict_batch(texts):
    """Predict categories for multiple texts"""
    results = []
    for text in texts:
        results.append(predict(text))
    return results


# Test examples
if __name__ == "__main__":
    print("="*60)
    print("TRANSACTION CATEGORY PREDICTOR")
    print("="*60)
    
    # Test with some examples
    test_examples = [
        "Netflix subscription monthly",
        "Uber ride to downtown",
        "Walmart grocery shopping",
        "Transfer to savings account",
        "Doctor visit copay"
    ]
    
    print("\n📊 Testing with sample transactions:\n")
    for example in test_examples:
        result = predict(example)
        print(f"Text: {result['text']}")
        print(f"  → Category: {result['category']}")
        print(f"  → Confidence: {result['confidence']:.2%} ({result['confidence_level']})")
        if result['confidence'] < 0.7:
            alternatives = ', '.join([f"{p['category']} ({p['confidence']:.1%})" for p in result['top_predictions'][1:]])
            print(f"  → Alternatives: {alternatives}")
        print()
    
    # Interactive mode
    print("\n" + "="*60)
    print("INTERACTIVE MODE - Enter transaction remarks to predict")
    print("Type 'quit' or 'exit' to stop")
    print("="*60 + "\n")
    
    while True:
        try:
            user_input = input("Enter remark: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
                
            if not user_input:
                continue
            
            result = predict(user_input)
            print(f"\n✓ Category: {result['category']}")
            print(f"  Confidence: {result['confidence']:.2%} ({result['confidence_level']})")
            
            if result['confidence'] < 0.7:
                print(f"  Other possibilities:")
                for pred in result['top_predictions'][1:]:
                    print(f"    - {pred['category']}: {pred['confidence']:.1%}")
            print()
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}\n")
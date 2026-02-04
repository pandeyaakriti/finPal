#ai/predict.py
import torch
import json
import re
import os
import sys
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch.nn.functional as F
from dotenv import load_dotenv
import warnings

# Suppress all warnings when running in CLI mode
if len(sys.argv) > 2 and sys.argv[1] == "--predict":
    warnings.filterwarnings("ignore")
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow logs
    import logging
    logging.disable(logging.CRITICAL)

# Load .env
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = os.getenv("MODEL_ID", "finPal/distilbert")

# Load label mapping
LABEL_MAP_FILE = "label_map.json"
try:
    with open(LABEL_MAP_FILE, "r") as f:
        maps = json.load(f)
except FileNotFoundError:
    # Try looking in the same directory as the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    label_map_path = os.path.join(script_dir, LABEL_MAP_FILE)
    try:
        with open(label_map_path, "r") as f:
            maps = json.load(f)
    except FileNotFoundError:
        print(json.dumps({"error": "label_map.json not found"}), file=sys.stderr)
        sys.exit(1)

id2label = {int(k): v for k, v in maps["id2label"].items()}
label2id = {v: int(k) for k, v in maps["id2label"].items()}

# Load model and tokenizer
try:
    tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
    model = DistilBertForSequenceClassification.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
    model.eval()
except Exception as e:
    if len(sys.argv) > 2 and sys.argv[1] == "--predict":
        print(json.dumps({"error": f"Failed to load model: {str(e)}"}), file=sys.stderr)
        sys.exit(1)
    else:
        raise

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)


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
    try:
        text = preprocess_text(text)

        # Tokenize
        inputs = tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            padding="max_length", 
            max_length=128
        )

        inputs = {k: v.to(device) for k, v in inputs.items()}

        # Predict
        with torch.no_grad():
            logits = model(**inputs).logits

        probs = F.softmax(logits, dim=-1)[0]
        top_probs, top_indices = torch.topk(probs, min(top_k, len(id2label)))

        pred_id = top_indices[0].item()
        confidence = top_probs[0].item()

        top_predictions = [
            {
                "category": id2label[idx.item()],
                "confidence": float(prob.item())
            }
            for prob, idx in zip(top_probs, top_indices)
        ]

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
    except Exception as e:
        return {
            "error": str(e),
            "text": text
        }


if __name__ == "__main__":
    # Check if running in CLI mode (called from Node.js)
    if len(sys.argv) > 2 and sys.argv[1] == "--predict":
        # CLI mode: predict single transaction
        try:
            text = sys.argv[2]
            result = predict(text)
            
            # Check for errors in result
            if "error" in result:
                print(json.dumps(result), file=sys.stderr)
                sys.exit(1)
            
            # Output ONLY JSON for Node.js to parse
            print(json.dumps(result))
            sys.exit(0)
        except Exception as e:
            error_result = {
                "error": str(e),
                "type": type(e).__name__
            }
            print(json.dumps(error_result), file=sys.stderr)
            sys.exit(1)
    
    # Interactive mode (original behavior)
    print("="*60)
    print("TRANSACTION CATEGORY PREDICTOR")
    print("="*60)

    # Test examples
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
        if "error" in result:
            print(f"❌ Error: {result['error']}")
            continue
            
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
            
            if "error" in result:
                print(f"\n❌ Error: {result['error']}\n")
                continue
                
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
"""
retrain_model.py

Retrain the DistilBERT model with user corrections
This script fetches corrections from the database and fine-tunes the model
"""

import os
import json
import requests
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    AdamW,
    get_linear_schedule_with_warmup
)
from sklearn.model_selection import train_test_split
from tqdm import tqdm
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Configuration
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = os.getenv("MODEL_ID", "finPal/distilbert")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
OUTPUT_DIR = "./model/retrained"
BATCH_SIZE = 16
LEARNING_RATE = 2e-5
EPOCHS = 3

# Label mapping
LABEL_MAP = {
    0: 'education',
    1: 'entertainment',
    2: 'food & dining',
    3: 'healthcare',
    4: 'insurance',
    5: 'miscellaneous',
    6: 'rent',
    7: 'savings/investments',
    8: 'shopping',
    9: 'subscriptions',
    10: 'tax',
    11: 'transfers',
    12: 'transportation',
    13: 'utilities'
}

class TransactionDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }


def fetch_corrections_from_api():
    """Fetch corrections from backend API"""
    try:
        print("📥 Fetching corrections from backend...")
        response = requests.get(f"{BACKEND_URL}/api/ai-labeling/export-corrections")
        
        if response.status_code == 200:
            # Save CSV temporarily
            with open("corrections_temp.csv", "w") as f:
                f.write(response.text)
            
            df = pd.read_csv("corrections_temp.csv")
            os.remove("corrections_temp.csv")
            
            print(f"✅ Fetched {len(df)} corrections")
            return df
        else:
            print(f"❌ Failed to fetch corrections: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error fetching corrections: {e}")
        return None


def load_original_training_data():
    """Load original training data if available"""
    try:
        if os.path.exists("./data/training_data.csv"):
            print("📥 Loading original training data...")
            df = pd.read_csv("./data/training_data.csv")
            print(f"✅ Loaded {len(df)} original training samples")
            return df
        else:
            print("⚠️  No original training data found, using only corrections")
            return None
    except Exception as e:
        print(f"❌ Error loading original data: {e}")
        return None


def prepare_data():
    """Prepare training data by combining original + corrections"""
    
    # Fetch user corrections
    corrections_df = fetch_corrections_from_api()
    
    if corrections_df is None or len(corrections_df) == 0:
        print("❌ No corrections available for retraining")
        return None, None
    
    # Load original training data
    original_df = load_original_training_data()
    
    # Combine datasets
    if original_df is not None:
        # Ensure column names match
        corrections_df.columns = ['text', 'label']
        original_df.columns = ['text', 'label']
        
        combined_df = pd.concat([original_df, corrections_df], ignore_index=True)
        print(f"📊 Combined dataset: {len(original_df)} original + {len(corrections_df)} corrections = {len(combined_df)} total")
    else:
        combined_df = corrections_df
        print(f"📊 Using {len(combined_df)} corrections only")
    
    # Split data
    train_df, val_df = train_test_split(combined_df, test_size=0.15, random_state=42, stratify=combined_df['label'])
    
    print(f"📊 Train set: {len(train_df)} samples")
    print(f"📊 Validation set: {len(val_df)} samples")
    
    return train_df, val_df


def train_model(train_df, val_df):
    """Fine-tune the model with new data"""
    
    print("\n" + "="*60)
    print("🚀 STARTING MODEL RETRAINING")
    print("="*60 + "\n")
    
    # Load tokenizer and model
    print("📥 Loading base model...")
    tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_ID, use_auth_token=HF_TOKEN)
    model = DistilBertForSequenceClassification.from_pretrained(
        MODEL_ID, 
        use_auth_token=HF_TOKEN,
        num_labels=len(LABEL_MAP)
    )
    
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    print(f"✅ Model loaded on: {device}\n")
    
    # Create datasets
    train_dataset = TransactionDataset(
        train_df['text'].values,
        train_df['label'].values,
        tokenizer
    )
    
    val_dataset = TransactionDataset(
        val_df['text'].values,
        val_df['label'].values,
        tokenizer
    )
    
    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)
    
    # Optimizer and scheduler
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=0,
        num_training_steps=total_steps
    )
    
    # Training loop
    best_val_acc = 0
    
    for epoch in range(EPOCHS):
        print(f"\n📚 Epoch {epoch + 1}/{EPOCHS}")
        print("-" * 60)
        
        # Training
        model.train()
        train_loss = 0
        train_correct = 0
        train_total = 0
        
        progress_bar = tqdm(train_loader, desc="Training")
        
        for batch in progress_bar:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            optimizer.zero_grad()
            
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            scheduler.step()
            
            train_loss += loss.item()
            
            # Calculate accuracy
            predictions = torch.argmax(outputs.logits, dim=1)
            train_correct += (predictions == labels).sum().item()
            train_total += labels.size(0)
            
            progress_bar.set_postfix({
                'loss': f'{loss.item():.4f}',
                'acc': f'{train_correct/train_total:.4f}'
            })
        
        avg_train_loss = train_loss / len(train_loader)
        train_accuracy = train_correct / train_total
        
        # Validation
        model.eval()
        val_loss = 0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for batch in tqdm(val_loader, desc="Validation"):
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)
                
                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                val_loss += outputs.loss.item()
                
                predictions = torch.argmax(outputs.logits, dim=1)
                val_correct += (predictions == labels).sum().item()
                val_total += labels.size(0)
        
        avg_val_loss = val_loss / len(val_loader)
        val_accuracy = val_correct / val_total
        
        print(f"\n📊 Results:")
        print(f"   Train Loss: {avg_train_loss:.4f} | Train Acc: {train_accuracy:.4f}")
        print(f"   Val Loss: {avg_val_loss:.4f} | Val Acc: {val_accuracy:.4f}")
        
        # Save best model
        if val_accuracy > best_val_acc:
            best_val_acc = val_accuracy
            print(f"\n💾 Saving best model (val_acc: {val_accuracy:.4f})...")
            
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            model.save_pretrained(OUTPUT_DIR)
            tokenizer.save_pretrained(OUTPUT_DIR)
            
            # Save metadata
            metadata = {
                "retrained_at": datetime.now().isoformat(),
                "base_model": MODEL_ID,
                "epochs": EPOCHS,
                "learning_rate": LEARNING_RATE,
                "best_val_accuracy": best_val_acc,
                "train_samples": len(train_df),
                "val_samples": len(val_df)
            }
            
            with open(f"{OUTPUT_DIR}/retrain_metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)
            
            print("✅ Model saved!")
    
    print("\n" + "="*60)
    print(f"🎉 RETRAINING COMPLETE!")
    print(f"   Best Validation Accuracy: {best_val_acc:.4f}")
    print(f"   Model saved to: {OUTPUT_DIR}")
    print("="*60 + "\n")
    
    return model, tokenizer


def upload_to_huggingface(model, tokenizer):
    """Upload retrained model to HuggingFace (optional)"""
    try:
        from huggingface_hub import login, HfApi
        
        login(HF_TOKEN)
        
        print("\n📤 Uploading to HuggingFace...")
        model.push_to_hub(MODEL_ID, use_auth_token=HF_TOKEN)
        tokenizer.push_to_hub(MODEL_ID, use_auth_token=HF_TOKEN)
        print("✅ Model uploaded to HuggingFace!")
        
    except Exception as e:
        print(f"⚠️  Could not upload to HuggingFace: {e}")
        print("   Model is saved locally in ./model/retrained")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔄 MODEL RETRAINING PIPELINE")
    print("="*60 + "\n")
    
    # Prepare data
    train_df, val_df = prepare_data()
    
    if train_df is None:
        print("❌ No data available for retraining. Exiting.")
        exit(1)
    
    # Check minimum samples
    if len(train_df) < 50:
        print(f"⚠️  Warning: Only {len(train_df)} training samples. Consider collecting more corrections.")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            print("❌ Retraining cancelled.")
            exit(0)
    
    # Train model
    model, tokenizer = train_model(train_df, val_df)
    
    # Optional: Upload to HuggingFace
    upload_choice = input("\n📤 Upload retrained model to HuggingFace? (y/n): ")
    if upload_choice.lower() == 'y':
        upload_to_huggingface(model, tokenizer)
    
    print("\n✅ All done! Your model is ready to use.")
    print(f"   Local path: {OUTPUT_DIR}")
    print(f"   To use it, update MODEL_ID in .env to point to the retrained model.")
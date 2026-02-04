"""
retrain_corrections_only.py

Train the model ONLY with user corrections (no original training data).
This script:
1. Fetches ONLY the 100+ corrections from database
2. Trains from scratch or continues from existing model
3. Does NOT combine with original training data
4. Updates job status in the database
"""

import os
import sys
import json
import argparse
import requests
import pandas as pd
import numpy as np
import torch
import re
from datasets import Dataset, DatasetDict
from sklearn.model_selection import train_test_split
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments,
    EarlyStoppingCallback
)
from torch.nn import CrossEntropyLoss
from sklearn.metrics import accuracy_score, f1_score, classification_report
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
EXISTING_MODEL_PATH = "./model"  # Your already trained model
OUTPUT_DIR = "./model/retrained"

# Training parameters
BATCH_SIZE = 4
GRADIENT_ACCUMULATION_STEPS = 8
LEARNING_RATE = 2e-5
EPOCHS = 8
MAX_LENGTH = 96


def update_job_status(job_id, status, data=None):
    """Update job status via API"""
    try:
        payload = {"status": status, **(data or {})}
        response = requests.put(
            f"{BACKEND_URL}/api/retraining/jobs/{job_id}",
            json=payload,
            timeout=10
        )
        if response.status_code == 200:
            print(f"✅ Job status updated: {status}")
        else:
            print(f"⚠️ Failed to update job status: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Error updating job status: {e}")


def fetch_corrections():
    """Fetch ONLY corrections from database (no original data)"""
    try:
        print("📥 Fetching corrections from database...")
        response = requests.get(
            f"{BACKEND_URL}/api/retraining/export-corrections",
            timeout=30
        )
        
        if response.status_code == 200:
            # Parse CSV response
            from io import StringIO
            corrections_df = pd.read_csv(StringIO(response.text))
            print(f"✅ Fetched {len(corrections_df)} corrections")
            return corrections_df
        else:
            print(f"❌ Failed to fetch corrections: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error fetching corrections: {e}")
        return None


def preprocess_text(text):
    """Preprocess text (same as train.py)"""
    text = str(text).strip()
    text = re.sub(r'\s+', ' ', text)
    return text


def prepare_training_data():
    """Prepare training data from ONLY corrections"""
    
    # Fetch corrections
    corrections_df = fetch_corrections()
    
    if corrections_df is None or len(corrections_df) == 0:
        print("❌ No corrections available")
        return None, None, None
    
    # Preprocess
    corrections_df["text"] = corrections_df["text"].apply(preprocess_text)
    corrections_df["label"] = corrections_df["label"].astype(str).str.strip().str.lower()
    
    # Remove empty
    corrections_df = corrections_df[
        (corrections_df["text"].str.len() > 0) & 
        (corrections_df["label"].notna())
    ]
    
    print(f"\n📊 Training with ONLY corrections: {len(corrections_df)} samples")
    print(f"\n📊 Label distribution:\n{corrections_df['label'].value_counts()}")
    
    # Create label mapping
    labels = sorted(corrections_df["label"].unique().tolist())
    label2id = {l: i for i, l in enumerate(labels)}
    id2label = {i: l for l, i in label2id.items()}
    
    corrections_df["label_id"] = corrections_df["label"].map(label2id)
    
    # Check if we have enough samples
    if len(corrections_df) < 50:
        print(f"⚠️ Warning: Only {len(corrections_df)} samples. Consider collecting more.")
    
    # Stratified split
    try:
        train_df, test_df = train_test_split(
            corrections_df[["text", "label_id"]], 
            test_size=0.2, 
            random_state=42,
            stratify=corrections_df["label_id"]
        )
    except ValueError:
        # If stratification fails (too few samples per class), do random split
        print("⚠️ Not enough samples for stratified split, using random split")
        train_df, test_df = train_test_split(
            corrections_df[["text", "label_id"]], 
            test_size=0.2, 
            random_state=42
        )
    
    print(f"📊 Train: {len(train_df)} | Test: {len(test_df)}")
    
    return train_df, test_df, {"label2id": label2id, "id2label": id2label}


class WeightedTrainer(Trainer):
    """Custom trainer with class weighting"""
    def __init__(self, *args, class_weights=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.class_weights = class_weights
    
    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        labels = inputs.get("labels")
        if labels is None:
            labels = inputs.pop("label_ids", None)
        else:
            labels = inputs.pop("labels")
            
        outputs = model(**inputs)
        logits = outputs.logits
        
        if self.class_weights is not None:
            loss_fct = CrossEntropyLoss(weight=self.class_weights.to(logits.device))
        else:
            loss_fct = CrossEntropyLoss()
        
        loss = loss_fct(logits, labels)
        
        return (loss, outputs) if return_outputs else loss


def compute_metrics(eval_pred):
    """Metrics computation"""
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    
    acc = accuracy_score(labels, predictions)
    f1_macro = f1_score(labels, predictions, average='macro', zero_division=0)
    f1_weighted = f1_score(labels, predictions, average='weighted', zero_division=0)
    
    return {
        'accuracy': acc,
        'f1_macro': f1_macro,
        'f1_weighted': f1_weighted
    }


def retrain_model(train_df, test_df, label_map, job_id=None):
    """Continue training the existing model with ONLY corrections"""
    
    print("\n" + "="*60)
    print("🚀 RETRAINING MODEL WITH CORRECTIONS ONLY")
    print("="*60 + "\n")
    
    # Load existing model and tokenizer
    print(f"📥 Loading existing model from {EXISTING_MODEL_PATH}...")
    
    if not os.path.exists(EXISTING_MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {EXISTING_MODEL_PATH}")
    
    tokenizer = DistilBertTokenizerFast.from_pretrained(EXISTING_MODEL_PATH)
    model = DistilBertForSequenceClassification.from_pretrained(
        EXISTING_MODEL_PATH,
        num_labels=len(label_map["id2label"]),
        id2label=label_map["id2label"],
        label2id=label_map["label2id"],
        dropout=0.3,
        attention_dropout=0.3,
        ignore_mismatched_sizes=True
    )
    
    model.config.use_cache = False
    model.gradient_checkpointing_enable()
    
    print("✅ Model loaded successfully\n")
    
    # Tokenize data
    def tokenize_fn(batch):
        tokenized = tokenizer(
            batch["text"],
            truncation=True,
            padding="max_length",
            max_length=MAX_LENGTH,
            return_attention_mask=True
        )
        tokenized["labels"] = batch["label_id"]
        return tokenized
    
    dataset = DatasetDict({
        "train": Dataset.from_pandas(train_df, preserve_index=False),
        "test": Dataset.from_pandas(test_df, preserve_index=False)
    })
    
    tokenized_dataset = dataset.map(tokenize_fn, batched=True)
    
    # Calculate class weights
    class_counts = train_df["label_id"].value_counts().sort_index().values
    beta = 0.9999
    effective_num = 1.0 - np.power(beta, class_counts)
    weights = (1.0 - beta) / effective_num
    weights = weights / weights.sum() * len(weights)
    class_weights = torch.tensor(weights, dtype=torch.float)
    
    print(f"📊 Class weights: {class_weights}\n")
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION_STEPS,
        learning_rate=LEARNING_RATE,
        weight_decay=0.01,
        warmup_steps=100,
        eval_strategy="epoch",
        save_strategy="epoch",
        logging_steps=50,
        load_best_model_at_end=True,
        metric_for_best_model="f1_weighted",
        greater_is_better=True,
        report_to="none",
        save_total_limit=2,
        fp16=False,
        gradient_checkpointing=True,
    )
    
    # Create trainer
    trainer = WeightedTrainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["test"],
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
        class_weights=class_weights
    )
    
    # Train
    print("🚀 Starting training...")
    trainer.train()
    
    # Evaluate
    print("\n" + "="*60)
    print("📊 FINAL EVALUATION")
    print("="*60)
    
    eval_results = trainer.evaluate()
    print(f"\n✅ Test Accuracy: {eval_results['eval_accuracy']:.4f}")
    print(f"✅ Test F1 (macro): {eval_results['eval_f1_macro']:.4f}")
    print(f"✅ Test F1 (weighted): {eval_results['eval_f1_weighted']:.4f}")
    
    # Classification report
    predictions = trainer.predict(tokenized_dataset["test"])
    pred_labels = np.argmax(predictions.predictions, axis=-1)
    true_labels = predictions.label_ids
    
    print("\n" + "="*60)
    print("📋 CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(
        true_labels, 
        pred_labels, 
        target_names=[label_map["id2label"][str(i)] for i in range(len(label_map["id2label"]))],
        digits=4,
        zero_division=0
    ))
    
    # Save model
    print(f"\n💾 Saving retrained model to {OUTPUT_DIR}...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    
    # Save metadata
    metadata = {
        "retrained_at": datetime.now().isoformat(),
        "base_model": EXISTING_MODEL_PATH,
        "training_method": "corrections_only",
        "original_data_used": False,
        "epochs": EPOCHS,
        "learning_rate": LEARNING_RATE,
        "best_accuracy": eval_results['eval_accuracy'],
        "best_f1_weighted": eval_results['eval_f1_weighted'],
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "job_id": job_id
    }
    
    with open(f"{OUTPUT_DIR}/retrain_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    
    print("✅ Model saved successfully!\n")
    
    return eval_results['eval_f1_weighted']


def mark_corrections_used():
    """Mark corrections as used in database"""
    try:
        print("📝 Marking corrections as used...")
        response = requests.post(
            f"{BACKEND_URL}/api/retraining/mark-used",
            timeout=10
        )
        if response.status_code == 200:
            print("✅ Corrections marked as used")
        else:
            print(f"⚠️ Failed to mark corrections: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Error marking corrections: {e}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--job-id', type=str, help='Retraining job ID')
    parser.add_argument('--min-samples', type=int, default=50, help='Minimum samples required')
    args = parser.parse_args()
    
    job_id = args.job_id
    
    print("\n" + "="*60)
    print("🔄 MODEL RETRAINING WITH CORRECTIONS ONLY")
    print("="*60 + "\n")
    
    if job_id:
        print(f"📋 Job ID: {job_id}\n")
        update_job_status(job_id, "running")
    
    try:
        # Prepare data (ONLY corrections, no original data)
        train_df, test_df, label_map = prepare_training_data()
        
        if train_df is None:
            error_msg = "No corrections available for retraining"
            print(f"❌ {error_msg}")
            if job_id:
                update_job_status(job_id, "failed", {"errorMessage": error_msg})
            sys.exit(1)
        
        # Check minimum samples
        if len(train_df) < args.min_samples:
            error_msg = f"Insufficient samples: {len(train_df)} < {args.min_samples}"
            print(f"⚠️ {error_msg}")
            if job_id:
                update_job_status(job_id, "failed", {"errorMessage": error_msg})
            sys.exit(1)
        
        # Retrain model with ONLY corrections
        best_f1 = retrain_model(train_df, test_df, label_map, job_id)
        
        # Update job status
        if job_id:
            update_job_status(job_id, "completed", {
                "trainSamples": len(train_df),
                "valSamples": len(test_df),
                "bestValAccuracy": float(best_f1)
            })
        
        # Mark corrections as used
        mark_corrections_used()
        
        print("\n" + "="*60)
        print("🎉 RETRAINING COMPLETE!")
        print("="*60)
        print(f"\n✅ Retrained model saved to: {OUTPUT_DIR}")
        print(f"✅ Best F1 Score: {best_f1:.4f}")
        print(f"✅ Trained on {len(train_df)} corrections (NO original data)")
        print(f"\n💡 To use the new model:")
        print(f"   1. Backup current: mv ./model ./model.backup")
        print(f"   2. Use retrained: mv ./model/retrained ./model")
        
    except Exception as e:
        error_msg = str(e)
        print(f"\n❌ Error: {error_msg}")
        if job_id:
            update_job_status(job_id, "failed", {"errorMessage": error_msg})
        sys.exit(1)


if __name__ == "__main__":
    main()
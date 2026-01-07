import torch
import pandas as pd
import json
import numpy as np
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
import re


# -----------------------------------------
# 1. Load and clean dataset with better preprocessing
# -----------------------------------------
df = pd.read_csv("data/train.csv")

# Clean column names
df.columns = df.columns.str.strip().str.lower()

# Advanced text preprocessing
def preprocess_text(text):
    text = str(text).strip()
    # Preserve important patterns like amounts, codes, merchant names
    text = re.sub(r'\s+', ' ', text)  # normalize whitespace
    # Keep original case for better feature learning
    return text

df["text"] = df["text"].apply(preprocess_text)
df["label"] = df["label"].astype(str).str.strip().str.lower()

# Remove any rows with empty text or labels
df = df[(df["text"].str.len() > 0) & (df["label"].notna())]

print(f"Dataset size: {len(df)}")
print(f"\nClass distribution:\n{df['label'].value_counts()}")


# -----------------------------------------
# 2. Encode labels
# -----------------------------------------
labels = sorted(df["label"].unique().tolist())
label2id = {l: i for i, l in enumerate(labels)}
id2label = {i: l for l, i in label2id.items()}

df["label_id"] = df["label"].map(label2id)

# Save for prediction
with open("label_map.json", "w") as f:
    json.dump({"label2id": label2id, "id2label": id2label}, f, indent=2)


# -----------------------------------------
# 3. Stratified split for balanced train/test
# -----------------------------------------
from sklearn.model_selection import train_test_split

# Use sklearn for stratified split
train_df, test_df = train_test_split(
    df[["text", "label_id"]], 
    test_size=0.2, 
    random_state=42,
    stratify=df["label_id"]  # ensures balanced splits
)

dataset = DatasetDict({
    "train": Dataset.from_pandas(train_df, preserve_index=False),
    "test": Dataset.from_pandas(test_df, preserve_index=False)
})

print(f"\nTraining samples: {len(dataset['train'])}")
print(f"Test samples: {len(dataset['test'])}")


# -----------------------------------------
# 4. Tokenizer with better parameters
# -----------------------------------------
tokenizer = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")

def tokenize_fn(batch):
    tokenized = tokenizer(
        batch["text"],
        truncation=True,
        padding="max_length",
        max_length=128,  # increased from 48 for better context
        return_attention_mask=True
    )
    # Rename label_id to labels for the model
    tokenized["labels"] = batch["label_id"]
    return tokenized

tokenized_dataset = dataset.map(tokenize_fn, batched=True)


# -----------------------------------------
# 5. Load DistilBERT model
# -----------------------------------------
model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=len(labels),
    id2label=id2label,
    label2id=label2id,
    dropout=0.3,  # added dropout for regularization
    attention_dropout=0.3
)


# -----------------------------------------
# 6. Improved class weights using effective number
# -----------------------------------------
class_counts = df["label_id"].value_counts().sort_index().values
beta = 0.9999  # for effective number of samples
effective_num = 1.0 - np.power(beta, class_counts)
weights = (1.0 - beta) / effective_num
weights = weights / weights.sum() * len(weights)
weights = torch.tensor(weights, dtype=torch.float)

print(f"\nClass weights: {weights}")


# -----------------------------------------
# 7. Custom metrics
# -----------------------------------------
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    
    acc = accuracy_score(labels, predictions)
    f1_macro = f1_score(labels, predictions, average='macro')
    f1_weighted = f1_score(labels, predictions, average='weighted')
    
    return {
        'accuracy': acc,
        'f1_macro': f1_macro,
        'f1_weighted': f1_weighted
    }


# -----------------------------------------
# 8. Custom Trainer with class weighting
# -----------------------------------------
class WeightedTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        labels = inputs.get("labels")
        if labels is None:
            labels = inputs.pop("label_ids", None)
        else:
            labels = inputs.pop("labels")
            
        outputs = model(**inputs)
        logits = outputs.logits
        
        loss_fct = CrossEntropyLoss(weight=weights.to(logits.device))
        loss = loss_fct(logits, labels)
        
        return (loss, outputs) if return_outputs else loss


# -----------------------------------------
# 9. Improved training arguments
# -----------------------------------------
training_args = TrainingArguments(
    output_dir="./model",
    num_train_epochs=10,  # increased epochs
    per_device_train_batch_size=32,  # increased batch size
    per_device_eval_batch_size=32,
    learning_rate=2e-5,  # slightly lower learning rate
    weight_decay=0.01,  # added weight decay for regularization
    warmup_steps=500,  # learning rate warmup
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_steps=50,
    load_best_model_at_end=True,
    metric_for_best_model="f1_weighted",  # optimize for F1 instead of loss
    greater_is_better=True,
    report_to="none",
    save_total_limit=3,  # keep only 3 best checkpoints
    fp16=torch.cuda.is_available(),  # mixed precision if GPU available
)


# -----------------------------------------
# 10. Train with early stopping
# -----------------------------------------
trainer = WeightedTrainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
)

print("\n" + "="*50)
print("Starting training...")
print("="*50 + "\n")

trainer.train()

# Evaluate on test set
print("\n" + "="*50)
print("Final evaluation:")
print("="*50)
eval_results = trainer.evaluate()
print(f"\nTest Accuracy: {eval_results['eval_accuracy']:.4f}")
print(f"Test F1 (macro): {eval_results['eval_f1_macro']:.4f}")
print(f"Test F1 (weighted): {eval_results['eval_f1_weighted']:.4f}")

# Get detailed classification report
predictions = trainer.predict(tokenized_dataset["test"])
pred_labels = np.argmax(predictions.predictions, axis=-1)
true_labels = predictions.label_ids

print("\n" + "="*50)
print("Classification Report:")
print("="*50)
print(classification_report(
    true_labels, 
    pred_labels, 
    target_names=[id2label[i] for i in range(len(labels))],
    digits=4
))

# Save model
trainer.save_model("./model")
tokenizer.save_pretrained("./model")

print("\n✅ MODEL TRAINED AND SAVED TO ./model")
import pandas as pd
import json
import torch
from datasets import Dataset
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments
)

# 1. Load dataset
df = pd.read_csv("data/train.csv")

# Basic cleaning
df["text"] = df["text"].str.lower().str.strip()

# 2. Encode labels
labels = sorted(df["label"].unique())
label2id = {label: i for i, label in enumerate(labels)}
id2label = {i: label for label, i in label2id.items()}

df["label"] = df["label"].map(label2id)

# Save label mapping
with open("label_map.json", "w") as f:
    json.dump({"label2id": label2id, "id2label": id2label}, f, indent=4)

# 3. Convert to HuggingFace dataset
dataset = Dataset.from_pandas(df)

# 4. Load tokenizer
tokenizer = DistilBertTokenizerFast.from_pretrained(
    "distilbert-base-uncased"
)

def tokenize(batch):
    return tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=64
    )

dataset = dataset.map(tokenize, batched=True)
dataset = dataset.rename_column("label", "labels")
dataset.set_format(
    "torch",
    columns=["input_ids", "attention_mask", "labels"]
)

# 5. Train-test split
dataset = dataset.train_test_split(test_size=0.2)

# 6. Load model
model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=len(labels),
    id2label=id2label,
    label2id=label2id
)

# 7. Training arguments
training_args = TrainingArguments(
    output_dir="./model",
    eval_strategy="epoch",

    save_strategy="no",          # 🔥 disable checkpoints
    logging_strategy="steps",
    logging_steps=50,

    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=4,
    weight_decay=0.01,

    report_to="none"             # avoids extra logging junk
)


# 8. Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    tokenizer=tokenizer
)

# 9. Train
trainer.train()
trainer.save_model("./model")
tokenizer.save_pretrained("./model")


# 10. Save model
model.save_pretrained("./model")
tokenizer.save_pretrained("./model")

print("✅ Training complete. Model saved in /model")

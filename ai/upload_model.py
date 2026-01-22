# ai/upload_model.py
from huggingface_hub import upload_folder

repo_id = "finPal/distilbert"
folder_path = "./model"  # path where your trained model is saved

upload_folder(
    repo_id=repo_id,
    folder_path=folder_path,
    repo_type="model",
)

print("Model uploaded successfully!")

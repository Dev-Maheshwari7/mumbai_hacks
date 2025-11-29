# 

import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

# Force offline mode
os.environ["TRANSFORMERS_OFFLINE"] = "1"

model_name = "openai-community/roberta-base-openai-detector"

# Load tokenizer & model locally only
tokenizer = AutoTokenizer.from_pretrained(model_name, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(model_name, local_files_only=True)

pipe = pipeline(
    "text-classification",
    model=model,
    tokenizer=tokenizer
)

response = pipe("i like big nutts and i cannot lie")
print(response)

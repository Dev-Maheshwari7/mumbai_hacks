from transformers import pipeline
import torch

# print(torch.cuda.is_available())
# print(torch.cuda.get_device_name(0))

pipe = pipeline("text-classification", model="openai-community/roberta-base-openai-detector")
response = pipe("aliens are real.")
print(response)
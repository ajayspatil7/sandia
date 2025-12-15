"""
BERT-based Malware Classifier
Uses DistilBERT for efficient shell script classification
"""

import torch
import torch.nn as nn
from transformers import DistilBertModel, DistilBertTokenizer


class MalwareBERT(nn.Module):
    """
    BERT-based malware classification model

    Architecture:
    - DistilBERT base (66M parameters)
    - Classification head (2 layers)
    - Binary classification (benign/malicious)
    """

    def __init__(
        self,
        pretrained_model: str = 'distilbert-base-uncased',
        num_classes: int = 2,
        dropout: float = 0.3,
        freeze_bert: bool = False
    ):
        super(MalwareBERT, self).__init__()

        # Load pre-trained DistilBERT
        self.bert = DistilBertModel.from_pretrained(pretrained_model)

        # Freeze BERT weights if specified (for faster training)
        if freeze_bert:
            for param in self.bert.parameters():
                param.requires_grad = False

        # BERT output dimension
        self.bert_dim = self.bert.config.hidden_size  # 768 for distilbert-base

        # Classification head
        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(self.bert_dim, 256)
        self.fc2 = nn.Linear(256, num_classes)

        self.relu = nn.ReLU()

    def forward(self, input_ids, attention_mask):
        """
        Forward pass

        Args:
            input_ids: Token IDs [batch_size, seq_len]
            attention_mask: Attention mask [batch_size, seq_len]

        Returns:
            logits: Classification logits [batch_size, num_classes]
        """

        # Get BERT embeddings
        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Use [CLS] token representation (first token)
        cls_output = outputs.last_hidden_state[:, 0, :]  # [batch_size, bert_dim]

        # Classification head
        x = self.dropout(cls_output)
        x = self.fc1(x)
        x = self.relu(x)
        x = self.dropout(x)
        logits = self.fc2(x)

        return logits

    def predict(self, input_ids, attention_mask):
        """
        Make prediction with probabilities

        Returns:
            dict with prediction results
        """
        self.eval()
        with torch.no_grad():
            logits = self.forward(input_ids, attention_mask)
            probs = torch.softmax(logits, dim=1)

            predicted_class = torch.argmax(probs, dim=1).item()
            confidence = probs[0, predicted_class].item()

            # Probability of malicious class (class 1)
            prob_malicious = probs[0, 1].item()

            return {
                'predicted_class': predicted_class,
                'is_malicious': predicted_class == 1,
                'confidence': confidence,
                'prob_benign': probs[0, 0].item(),
                'prob_malicious': prob_malicious,
                'logits': logits[0].cpu().numpy().tolist()
            }

    def count_parameters(self):
        """Count trainable and total parameters"""
        trainable = sum(p.numel() for p in self.parameters() if p.requires_grad)
        total = sum(p.numel() for p in self.parameters())
        return {
            'trainable_parameters': trainable,
            'total_parameters': total,
            'frozen_parameters': total - trainable
        }


def get_tokenizer(model_name: str = 'distilbert-base-uncased'):
    """Get BERT tokenizer"""
    return DistilBertTokenizer.from_pretrained(model_name)


def prepare_input(text: str, tokenizer, max_length: int = 512, device: str = 'cpu'):
    """
    Tokenize text for BERT input

    Args:
        text: Input text
        tokenizer: BERT tokenizer
        max_length: Maximum sequence length
        device: torch device

    Returns:
        input_ids, attention_mask
    """
    encoded = tokenizer.encode_plus(
        text,
        add_special_tokens=True,
        max_length=max_length,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt'
    )

    input_ids = encoded['input_ids'].to(device)
    attention_mask = encoded['attention_mask'].to(device)

    return input_ids, attention_mask

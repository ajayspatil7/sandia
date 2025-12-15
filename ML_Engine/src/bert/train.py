"""
BERT Training Script for Malware Detection
Fine-tunes DistilBERT on shell script dataset with data augmentation
"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import get_linear_schedule_with_warmup
import os
import json
import random
from tqdm import tqdm
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bert.model import MalwareBERT, get_tokenizer, prepare_input
from bert.preprocessor import ShellScriptPreprocessor
from bert.augmentation import augment_dataset


class ShellScriptDataset(Dataset):
    """Dataset for shell scripts"""

    def __init__(self, scripts, labels, tokenizer, preprocessor, max_length=512):
        self.scripts = scripts
        self.labels = labels
        self.tokenizer = tokenizer
        self.preprocessor = preprocessor
        self.max_length = max_length

    def __len__(self):
        return len(self.scripts)

    def __getitem__(self, idx):
        script = self.scripts[idx]
        label = self.labels[idx]

        # Preprocess script to BERT-friendly format
        text, features = self.preprocessor.prepare_for_bert(script)

        # Tokenize
        encoded = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoded['input_ids'].flatten(),
            'attention_mask': encoded['attention_mask'].flatten(),
            'label': torch.tensor(label, dtype=torch.long)
        }


def load_dataset(data_dir, shuffle=True):
    """Load shell scripts from directory"""
    scripts = []
    labels = []

    # Load malicious scripts
    malicious_dir = os.path.join(data_dir, 'malicious')
    if os.path.exists(malicious_dir):
        for filename in os.listdir(malicious_dir):
            if filename.endswith('.sh'):
                filepath = os.path.join(malicious_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        script = f.read()
                        if script.strip():  # Skip empty files
                            scripts.append(script)
                            labels.append(1)  # Malicious
                except Exception as e:
                    print(f"[WARN] Failed to load {filepath}: {e}")

    # Load benign scripts
    benign_dir = os.path.join(data_dir, 'benign')
    if os.path.exists(benign_dir):
        for filename in os.listdir(benign_dir):
            if filename.endswith('.sh'):
                filepath = os.path.join(benign_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        script = f.read()
                        if script.strip():  # Skip empty files
                            scripts.append(script)
                            labels.append(0)  # Benign
                except Exception as e:
                    print(f"[WARN] Failed to load {filepath}: {e}")

    print(f"Loaded {len(scripts)} scripts ({sum(labels)} malicious, {len(labels) - sum(labels)} benign)")

    # Shuffle data
    if shuffle:
        combined = list(zip(scripts, labels))
        random.shuffle(combined)
        scripts, labels = zip(*combined) if combined else ([], [])
        scripts, labels = list(scripts), list(labels)

    return scripts, labels


def train_epoch(model, dataloader, optimizer, scheduler, device, criterion):
    """Train for one epoch"""
    model.train()
    total_loss = 0
    correct = 0
    total = 0

    for batch in tqdm(dataloader, desc="Training"):
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)

        optimizer.zero_grad()

        logits = model(input_ids, attention_mask)
        loss = criterion(logits, labels)

        loss.backward()
        optimizer.step()
        scheduler.step()

        total_loss += loss.item()

        # Calculate accuracy
        predictions = torch.argmax(logits, dim=1)
        correct += (predictions == labels).sum().item()
        total += labels.size(0)

    avg_loss = total_loss / len(dataloader)
    accuracy = correct / total

    return avg_loss, accuracy


def evaluate(model, dataloader, device, criterion):
    """Evaluate model"""
    model.eval()
    total_loss = 0
    correct = 0
    total = 0

    with torch.no_grad():
        for batch in tqdm(dataloader, desc="Evaluating"):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['label'].to(device)

            logits = model(input_ids, attention_mask)
            loss = criterion(logits, labels)

            total_loss += loss.item()

            predictions = torch.argmax(logits, dim=1)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)

    avg_loss = total_loss / len(dataloader)
    accuracy = correct / total

    return avg_loss, accuracy


def train_model(config=None):
    """Main training function"""

    if config is None:
        config = {
            'pretrained_model': 'distilbert-base-uncased',
            'max_length': 512,
            'batch_size': 4,          # Smaller batch for small dataset
            'epochs': 20,              # More epochs for better convergence
            'learning_rate': 1e-5,     # Lower LR for stability
            'dropout': 0.5,            # Higher dropout to prevent overfitting
            'freeze_bert': False,      # Fine-tune all layers
            'warmup_steps': 50,        # Less warmup for small dataset
            'augmentation_factor': 3,  # 3x data augmentation
            'weight_decay': 0.01,      # L2 regularization
        }

    # Paths
    dataset_dir = os.path.join(os.path.dirname(__file__), '../../datasets/raw')
    model_dir = os.path.join(os.path.dirname(__file__), '../../models/bert')
    os.makedirs(model_dir, exist_ok=True)

    # Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")

    # Load dataset
    print("\nLoading dataset...")
    scripts, labels = load_dataset(dataset_dir)

    if len(scripts) == 0:
        print("[ERROR] No scripts found in dataset!")
        return

    # Split train/val (80/20 split with shuffled data)
    split_idx = int(0.8 * len(scripts))
    train_scripts = scripts[:split_idx]
    train_labels = labels[:split_idx]
    val_scripts = scripts[split_idx:]
    val_labels = labels[split_idx:]

    print(f"Before augmentation - Train: {len(train_scripts)}, Val: {len(val_scripts)}")

    # Apply data augmentation to training set only
    if config.get('augmentation_factor', 0) > 0:
        print(f"\nApplying {config['augmentation_factor']}x data augmentation...")
        train_scripts, train_labels = augment_dataset(
            train_scripts, train_labels,
            augmentation_factor=config['augmentation_factor'],
            seed=42
        )

    print(f"After augmentation - Train: {len(train_scripts)}, Val: {len(val_scripts)}")

    # Initialize tokenizer and preprocessor
    print("\nInitializing tokenizer and preprocessor...")
    tokenizer = get_tokenizer(config['pretrained_model'])
    preprocessor = ShellScriptPreprocessor(max_length=config['max_length'])

    # Create datasets
    train_dataset = ShellScriptDataset(
        train_scripts, train_labels, tokenizer, preprocessor, config['max_length']
    )
    val_dataset = ShellScriptDataset(
        val_scripts, val_labels, tokenizer, preprocessor, config['max_length']
    )

    train_loader = DataLoader(train_dataset, batch_size=config['batch_size'], shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=config['batch_size'], shuffle=False)

    # Initialize model
    print("\nInitializing model...")
    model = MalwareBERT(
        pretrained_model=config['pretrained_model'],
        num_classes=2,
        dropout=config['dropout'],
        freeze_bert=config['freeze_bert']
    ).to(device)

    param_info = model.count_parameters()
    print(f"\nModel Info:")
    print(f"  Architecture: MalwareBERT (DistilBERT)")
    print(f"  Total parameters: {param_info['total_parameters']:,}")
    print(f"  Trainable parameters: {param_info['trainable_parameters']:,}")
    print(f"  Frozen parameters: {param_info['frozen_parameters']:,}")

    # Optimizer and scheduler
    optimizer = AdamW(
        model.parameters(),
        lr=config['learning_rate'],
        weight_decay=config.get('weight_decay', 0.01)
    )
    total_steps = len(train_loader) * config['epochs']
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=config['warmup_steps'],
        num_training_steps=total_steps
    )

    criterion = nn.CrossEntropyLoss()

    # Training loop
    print(f"\nStarting training for {config['epochs']} epochs...")
    best_val_acc = 0.0
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}

    for epoch in range(1, config['epochs'] + 1):
        print(f"\nEpoch {epoch}/{config['epochs']}")

        train_loss, train_acc = train_epoch(model, train_loader, optimizer, scheduler, device, criterion)
        val_loss, val_acc = evaluate(model, val_loader, device, criterion)

        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)

        print(f"  Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}")
        print(f"  Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            print(f"  [BEST] Saving model with val_acc: {val_acc:.4f}")

            # Save model
            model_path = os.path.join(model_dir, 'bert_malware_detector.pth')
            torch.save(model.state_dict(), model_path)

            # Save config
            config_path = os.path.join(model_dir, 'model_config.json')
            model_config = {
                'model_architecture': {
                    'architecture': 'MalwareBERT',
                    'pretrained_model': config['pretrained_model'],
                    'max_length': config['max_length'],
                    'dropout': config['dropout'],
                    'num_classes': 2,
                    **param_info
                },
                'training_config': config,
                'best_metrics': {
                    'val_loss': val_loss,
                    'val_accuracy': val_acc,
                    'train_accuracy': train_acc
                }
            }

            with open(config_path, 'w') as f:
                json.dump(model_config, f, indent=2)

            print(f"  Model saved to: {model_path}")

    print("\nTraining completed!")
    print(f"Best validation accuracy: {best_val_acc:.4f}")

    return model, history


if __name__ == '__main__':
    print("=" * 60)
    print("BERT Malware Classifier Training")
    print("=" * 60)

    model, history = train_model()

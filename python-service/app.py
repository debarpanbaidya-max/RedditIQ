from flask import Flask, request, jsonify
from flask_cors import CORS
from detoxify import Detoxify

app = Flask(__name__)
CORS(app)

# Load model once at startup (uses 'original' for speed — best for English comments)
print("Loading Detoxify model...")
model = Detoxify('original')
print("✅ Detoxify model loaded")


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "detoxify-original"})


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    if not data or 'comments' not in data:
        return jsonify({"error": "comments array is required"}), 400

    comments = data['comments']

    if not isinstance(comments, list) or len(comments) == 0:
        return jsonify({"error": "comments must be a non-empty array"}), 400

    # Run Detoxify on all comments at once (batch inference)
    predictions = model.predict(comments)

    # Convert to list of per-comment dicts
    results = []
    for i in range(len(comments)):
        result = {
            "toxicity": float(predictions["toxicity"][i]),
            "severe_toxicity": float(predictions["severe_toxicity"][i]),
            "obscene": float(predictions["obscene"][i]),
            "threat": float(predictions["threat"][i]),
            "insult": float(predictions["insult"][i]),
            "identity_attack": float(predictions["identity_attack"][i]),
        }
        results.append(result)

    return jsonify({"results": results})


@app.route('/analyze-single', methods=['POST'])
def analyze_single():
    """Analyze a single comment text"""
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({"error": "text field is required"}), 400

    text = data['text']
    predictions = model.predict(text)

    result = {
        "toxicity": float(predictions["toxicity"]),
        "severe_toxicity": float(predictions["severe_toxicity"]),
        "obscene": float(predictions["obscene"]),
        "threat": float(predictions["threat"]),
        "insult": float(predictions["insult"]),
        "identity_attack": float(predictions["identity_attack"]),
    }

    return jsonify({"result": result})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)

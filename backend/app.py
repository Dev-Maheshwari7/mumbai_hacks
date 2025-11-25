from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify(message='Hello, World!')

@app.route('/api/data')
def get_data():
    return jsonify(data=[1, 2, 3, 4, 5])

if __name__ == '__main__':
    app.run(debug=True)
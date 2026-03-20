from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Temporary in-memory store until SQL is connected
mock_database = []
issue_counter = 105


@app.route('/api/issues', methods=['GET'])
def get_issues():
    return jsonify({
        'success': True,
        'issues': mock_database
    }), 200


@app.route('/api/report', methods=['POST'])
def report_issue():
    global issue_counter
    try:
        data = request.json or {}

        new_issue = {
            'id': issue_counter,
            'title': data.get('title'),
            'category': data.get('category'),
            'description': data.get('description'),
            'location': data.get('location'),
            'priority': data.get('priority'),
            'status': 'Pending',
            'reporter': data.get('reporter', 'Armaan')
        }

        mock_database.append(new_issue)
        issue_counter += 1

        print('\n--- NEW ISSUE RECEIVED ---')
        print(f"Title: {new_issue['title']}")
        print(f"Location: {new_issue['location']}")
        print(f"Priority: {new_issue['priority']}")
        print('--------------------------\n')

        return jsonify({
            'success': True,
            'message': 'Data reached Python backend successfully.',
            'issue_id': new_issue['id']
        }), 201

    except Exception as error:
        print('Error:', error)
        return jsonify({'success': False, 'message': str(error)}), 500


if __name__ == '__main__':
    print('Flask server running on http://localhost:5000')
    app.run(debug=True, port=5000)

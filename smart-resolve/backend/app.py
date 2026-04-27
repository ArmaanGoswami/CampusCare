# Developed by Armaan Goswami - Smart Resolve Backend
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import os
import requests
import certifi
import sqlite3
import uuid
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Setup logging to file
LOG_FILE = os.path.join(os.path.dirname(__file__), "sheets_debug.log")
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app) # To connect React (Port 5173) to Flask (Port 5000)

# Google Sheets Configuration
# Support multiple credentials: use GOOGLE_CREDENTIALS_FILE env var if set, otherwise use default
SHEETS_CREDS_FILE = os.getenv(
    "GOOGLE_CREDENTIALS_FILE",
    os.path.join(os.path.dirname(__file__), "credentials.json")
)
SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "1F-Kp2sQQWRhJfSlBdeVb75D2vqjmlV1TZ931IfTQk-A")

HF_API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli"
HF_TOKEN = os.getenv("HF_TOKEN", "")
headers = {"Authorization": f"Bearer {HF_TOKEN}"}
TIDB_PASSWORD = os.getenv("TIDB_PASSWORD", "").strip()
# Force SQLite — TiDB credentials are expired / access-denied.
# Flip back to True once a valid TIDB_PASSWORD is available.
USE_TIDB = False
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "smart_resolve.db")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")

# Create uploads directory if it doesn't exist
os.makedirs(UPLOADS_DIR, exist_ok=True)


def init_sqlite_db():
    db = sqlite3.connect(SQLITE_DB_PATH)
    cursor = db.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'User'
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS Issues (
            issue_id INTEGER PRIMARY KEY AUTOINCREMENT,
            reported_by INTEGER NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            worker TEXT DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP DEFAULT NULL,
            FOREIGN KEY (reported_by) REFERENCES Users (user_id)
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS Comments (
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (issue_id) REFERENCES Issues (issue_id) ON DELETE CASCADE
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS Photos (
            photo_id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (issue_id) REFERENCES Issues (issue_id) ON DELETE CASCADE
        )
        """
    )
    db.commit()
    cursor.close()
    db.close()

# Function to connect to the database
def get_db_connection():
    if not USE_TIDB:
        db = sqlite3.connect(SQLITE_DB_PATH)
        db.row_factory = sqlite3.Row
        return db

    ssl_ca_path = os.getenv("TIDB_SSL_CA") or certifi.where()

    return mysql.connector.connect(
        host="gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
        port=4000,
        user="4H5oFsJ3dsQufjN.root",
        password=TIDB_PASSWORD,
        database="test",
        ssl_verify_cert=True,
        ssl_verify_identity=True,
        ssl_ca=ssl_ca_path,
    )


# ==========================================
# Google Sheets Integration Helper
# ==========================================
def append_to_google_sheets(data):
    """Append issue data to Google Sheets automatically"""
    try:
        logger.info(f"Starting Google Sheets sync for: {data.get('title')}")
        
        if not os.path.exists(SHEETS_CREDS_FILE):
            logger.warning(f"credentials.json not found at {SHEETS_CREDS_FILE}")
            return False
        
        logger.info(f"Loading credentials from {SHEETS_CREDS_FILE}")
        
        credentials = Credentials.from_service_account_file(
            SHEETS_CREDS_FILE,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        
        logger.info("Building Sheets service...")
        service = build('sheets', 'v4', credentials=credentials)
        
        # Prepare row data
        row_data = [
            datetime.now().strftime("%m/%d/%Y %H:%M:%S"),
            data.get('reporter', 'Unknown'),
            data.get('category', 'Unknown'),
            data.get('priority', 'Medium'),
            data.get('title', ''),
            data.get('location', ''),
            'Pending'
        ]
        
        logger.info(f"Appending to Sheet ID: {SHEET_ID}")
        logger.info(f"Data: {row_data}")
        
        body = {'values': [row_data]}
        
        result = service.spreadsheets().values().append(
            spreadsheetId=SHEET_ID,
            range='Sheet1!A:G',
            valueInputOption='USER_ENTERED',
            body=body
        ).execute()
        
        updated_rows = result.get('updates', {}).get('updatedRows', 0)
        logger.info(f"SUCCESS! Updated {updated_rows} rows")
        return True
        
    except Exception as e:
        logger.error(f"FAILED: {type(e).__name__}: {str(e)}", exc_info=True)
        return False


if not USE_TIDB:
    init_sqlite_db()
    print("ℹ️ TIDB_PASSWORD not found. Using local SQLite database.")


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "success": True,
        "message": "Smart Resolve backend is running",
        "routes": {
            "health": "/health",
            "predict_issue": "/api/predict",
            "report_issue": "/api/report",
            "list_issues": "/api/issues"
        }
    }), 200


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "ai_ready": bool(HF_TOKEN),
        "ai_provider": "huggingface_inference_api",
        "database": "tidb" if USE_TIDB else "sqlite"
    }), 200





@app.route('/api/report', methods=['POST'])
def report_issue():
    try:
        print(f"\n📬 [API] POST /api/report - Received complaint", flush=True)
        
        # Get form data from multipart/form-data request
        title = request.form.get('title')
        category = request.form.get('category')
        priority = request.form.get('priority')
        location = request.form.get('location')
        description = request.form.get('description')
        reporter_name = (request.form.get('reporter') or 'Armaan').strip()
        
        print(f"📝 [API] Title: {title}, Category: {category}, Reporter: {reporter_name}", flush=True)
        print(f"📸 [API] Photos received: {len(request.files.getlist('photos'))}", flush=True)
        
        # Open connection to database
        db = get_db_connection()
        cursor = db.cursor()

        placeholder = "%s" if USE_TIDB else "?"

        # Resolve reporter user_id from Users table; auto-create if not found.
        cursor.execute(
            f"SELECT user_id FROM Users WHERE LOWER(name) = LOWER({placeholder}) LIMIT 1",
            (reporter_name,)
        )
        user_row = cursor.fetchone()
        if user_row:
            if USE_TIDB:
                reported_by_id = user_row[0]
            else:
                reported_by_id = user_row["user_id"]
        else:
            cursor.execute(
                f"INSERT INTO Users (name, role) VALUES ({placeholder}, 'User')",
                (reporter_name,)
            )
            db.commit()
            reported_by_id = cursor.lastrowid
        
        # SQL Query for data insertion
        sql_query = """
            INSERT INTO Issues (reported_by, title, category, priority, location, description, status)
            VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, 'Pending')
        """
        sql_query = sql_query.format(placeholder=placeholder)
        values = (reported_by_id, title, category, priority, location, description)
        
        # Execute query and commit
        cursor.execute(sql_query, values)
        db.commit()
        
        # Print the ID of the newly created issue
        new_issue_id = cursor.lastrowid
        print(f"✅ [DB] Issue #{new_issue_id} saved to database", flush=True)
        
        # 📸 Handle photo uploads
        uploaded_photos = []
        files = request.files.getlist('photos')
        if files:
            print(f"📸 [API] Processing {len(files)} photos for issue #{new_issue_id}", flush=True)
            
            for file in files:
                if file and file.filename and file.filename.strip():
                    try:
                        # Save file with issue_id prefix for organization
                        import uuid
                        unique_suffix = str(uuid.uuid4())[:8]
                        original_name = file.filename
                        file_ext = os.path.splitext(original_name)[1]
                        saved_filename = f"issue_{new_issue_id}_{unique_suffix}{file_ext}"
                        file_path = os.path.join(UPLOADS_DIR, saved_filename)
                        
                        # Save the file
                        file.save(file_path)
                        print(f"✅ [API] Photo saved: {saved_filename}", flush=True)
                        
                        # Store photo reference in database
                        cursor.execute(
                            f"INSERT INTO Photos (issue_id, file_name, file_path) VALUES ({placeholder}, {placeholder}, {placeholder})",
                            (new_issue_id, original_name, saved_filename)
                        )
                        db.commit()
                        uploaded_photos.append(saved_filename)
                        
                    except Exception as photo_error:
                        print(f"❌ [API] Error saving photo: {photo_error}", flush=True)
        
        cursor.close()
        db.close()
        
        print(f"📸 [API] Total photos uploaded: {len(uploaded_photos)}", flush=True)

        # 🔥 Sync to Google Sheets automatically
        print(f"🔥 [API] Now syncing to Google Sheets...", flush=True)
        # Create data dict for sheets sync
        data_for_sheets = {
            'title': title,
            'category': category,
            'priority': priority,
            'location': location,
            'description': description,
            'reporter': reporter_name,
            'photos_count': len(uploaded_photos)
        }
        sheets_sync_success = append_to_google_sheets(data_for_sheets)
        print(f"📊 [API] Google Sheets sync result: {'SUCCESS' if sheets_sync_success else 'FAILED'}", flush=True)

        # Send success message back to React
        return jsonify({
            "success": True, 
            "message": "Data and photos saved successfully!", 
            "issue_id": new_issue_id,
            "photos_uploaded": len(uploaded_photos),
            "sheets_synced": sheets_sync_success
        }), 201

    except Exception as e:
        print(f"❌ [API] Error: {type(e).__name__}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# NEW API: Fetch all issues for Admin Board
# ==========================================
@app.route('/api/issues', methods=['GET'])
def get_all_issues():
    try:
        db = get_db_connection()
        # dictionary=True returns SQL data directly in JSON (key-value) format
        if USE_TIDB:
            cursor = db.cursor(dictionary=True)
        else:
            cursor = db.cursor()

        # SQL Query: JOIN Issues table with Users table to get reporter name
        query = """
            SELECT i.issue_id as id, i.title, i.category, i.priority,
                   i.location, i.status, i.worker, u.name as reporter, i.created_at
            FROM Issues i
            JOIN Users u ON i.reported_by = u.user_id
            ORDER BY i.created_at DESC
        """
        cursor.execute(query)
        issues_data = cursor.fetchall()

        if not USE_TIDB:
            issues_data = [dict(row) for row in issues_data]

        # Fetch photos for each issue - with absolute URLs
        placeholder = "%s" if USE_TIDB else "?"
        for issue in issues_data:
            cursor = db.cursor(dictionary=True) if USE_TIDB else db.cursor()
            cursor.execute(
                f"SELECT file_name, file_path FROM Photos WHERE issue_id = {placeholder} ORDER BY uploaded_at ASC",
                (issue['id'],)
            )
            photos = cursor.fetchall()
            if not USE_TIDB:
                photos = [dict(row) for row in photos]
            # Add photos with absolute URLs pointing to backend server
            base_url = request.host_url.rstrip('/')
            issue['photos'] = [f"{base_url}/uploads/{photo['file_path']}" for photo in photos]
            cursor.close()

        db.close()

        return jsonify({"success": True, "data": issues_data}), 200

    except Exception as e:
        print("❌ Error fetching issues:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# API: Get Photos for an Issue
# ==========================================
@app.route('/api/issues/<int:issue_id>/photos', methods=['GET'])
def get_issue_photos(issue_id):
    try:
        db = get_db_connection()
        if USE_TIDB:
            cursor = db.cursor(dictionary=True)
        else:
            cursor = db.cursor()

        placeholder = "%s" if USE_TIDB else "?"
        query = f"SELECT photo_id, file_name, file_path, uploaded_at FROM Photos WHERE issue_id = {placeholder} ORDER BY uploaded_at ASC"
        cursor.execute(query, (issue_id,))
        photos_data = cursor.fetchall()

        if not USE_TIDB:
            photos_data = [dict(row) for row in photos_data]

        cursor.close()
        db.close()

        return jsonify({"success": True, "data": photos_data}), 200

    except Exception as e:
        print(f"❌ Error fetching photos for issue {issue_id}:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# API: Serve Uploaded Files
# ==========================================
@app.route('/uploads/<filename>', methods=['GET', 'OPTIONS'])
def get_upload(filename):
    try:
        # Security: prevent directory traversal attacks
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({"success": False, "message": "Invalid filename"}), 400
        
        response = send_from_directory(UPLOADS_DIR, filename)
        # Ensure CORS headers are included
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        return response
    except Exception as e:
        print(f"❌ Error serving file {filename}:", e)
        return jsonify({"success": False, "message": "File not found"}), 404


@app.route('/api/issues/<int:issue_id>/status', methods=['PUT'])
def update_issue_status(issue_id):
    try:
        data = request.json or {}
        next_status = data.get('status')
        worker = data.get('worker')
        allowed_status = {'Pending', 'Assigned', 'In Progress', 'Resolved'}

        if next_status not in allowed_status:
            return jsonify({
                "success": False,
                "message": "Invalid status. Use Pending, Assigned, In Progress, or Resolved."
            }), 400

        db = get_db_connection()
        cursor = db.cursor()
        placeholder = "%s" if USE_TIDB else "?"

        if worker:
            cursor.execute(
                f"UPDATE Issues SET status = {placeholder}, worker = {placeholder} WHERE issue_id = {placeholder}",
                (next_status, worker, issue_id)
            )
        else:
            cursor.execute(
                f"UPDATE Issues SET status = {placeholder} WHERE issue_id = {placeholder}",
                (next_status, issue_id)
            )
        db.commit()

        if cursor.rowcount == 0:
            cursor.close()
            db.close()
            return jsonify({"success": False, "message": "Issue not found."}), 404

        cursor.close()
        db.close()

        print(f"✅ [API] Issue #{issue_id} => {next_status}" + (f" (worker: {worker})" if worker else ""), flush=True)

        return jsonify({
            "success": True,
            "message": f"Issue #{issue_id} status updated to {next_status}."
        }), 200
    except Exception as e:
        print("❌ Error updating issue status:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# 🔥 NEW API: Student Track Their Issue
# ==========================================
@app.route('/api/tracker/<int:issue_id>', methods=['GET'])
def track_issue(issue_id):
    """Student can track their issue status"""
    try:
        db = get_db_connection()
        if USE_TIDB:
            cursor = db.cursor(dictionary=True)
        else:
            cursor = db.cursor()

        # Get issue details with reporter name
        query = """
            SELECT i.issue_id as id, i.title, i.category, i.priority,
                   i.location, i.description, i.status, u.name as reporter, 
                   i.created_at, i.created_at as updated_at
            FROM Issues i
            JOIN Users u ON i.reported_by = u.user_id
            WHERE i.issue_id = ?
        """
        cursor.execute(query, (issue_id,))
        issue = cursor.fetchone()

        if not issue:
            cursor.close()
            db.close()
            return jsonify({"success": False, "message": "Issue not found"}), 404

        if not USE_TIDB:
            issue = dict(issue)

        # Timeline mapping
        timeline = {
            'Pending': {'step': 1, 'icon': '⏳', 'description': 'Waiting for admin review'},
            'Assigned': {'step': 2, 'icon': '👨‍💼', 'description': 'Assigned to team'},
            'In Progress': {'step': 3, 'icon': '🔧', 'description': 'Team is working on it'},
            'Resolved': {'step': 4, 'icon': '✅', 'description': 'Issue resolved'}
        }

        current_status = issue.get('status', 'Pending')
        progress = timeline.get(current_status, {}).get('step', 1)

        cursor.close()
        db.close()

        return jsonify({
            "success": True,
            "issue": issue,
            "currentStatus": current_status,
            "progress": progress,
            "timeline": timeline
        }), 200

    except Exception as e:
        print("❌ Error tracking issue:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# 🔥 NEW API: Get all issues by reporter
# ==========================================
@app.route('/api/my-issues/<reporter_name>', methods=['GET'])
def get_my_issues(reporter_name):
    """Get all issues submitted by a specific student"""
    try:
        db = get_db_connection()
        if USE_TIDB:
            cursor = db.cursor(dictionary=True)
        else:
            cursor = db.cursor()

        query = """
            SELECT i.issue_id as id, i.title, i.category, i.priority,
                   i.location, i.status, i.created_at
            FROM Issues i
            JOIN Users u ON i.reported_by = u.user_id
            WHERE LOWER(u.name) = LOWER(?)
            ORDER BY i.created_at DESC
        """
        cursor.execute(query, (reporter_name,))
        issues = cursor.fetchall()

        if not USE_TIDB:
            issues = [dict(row) for row in issues]

        cursor.close()
        db.close()

        return jsonify({
            "success": True,
            "data": issues,
            "count": len(issues)
        }), 200

    except Exception as e:
        print("❌ Error fetching issues:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# 🗑️ DELETE: Clear old complaint records
# ==========================================
@app.route('/api/admin/clear-records', methods=['DELETE'])
def clear_old_records():
    """Delete all old complaint records - Admin only"""
    try:
        data = request.json or {}
        days_old = data.get('days', 0)  # 0 = delete all
        
        db = get_db_connection()
        cursor = db.cursor()
        placeholder = "%s" if USE_TIDB else "?"

        if days_old > 0:
            # Delete records older than X days
            query = f"""
                DELETE FROM Issues 
                WHERE created_at < datetime('now', '-{days_old} days')
            """
            cursor.execute(query)
            deleted_issues = cursor.rowcount
        else:
            # Delete ALL records
            cursor.execute("DELETE FROM Issues")
            deleted_issues = cursor.rowcount
            cursor.execute("DELETE FROM Users")
            deleted_users = cursor.rowcount
            print(f"🗑️ Cleared {deleted_issues} issues and {deleted_users} users", flush=True)

        db.commit()
        cursor.close()
        db.close()

        print(f"🗑️ Deleted {deleted_issues} old complaint records", flush=True)

        return jsonify({
            "success": True,
            "message": f"Deleted {deleted_issues} complaint records successfully",
            "deleted_count": deleted_issues
        }), 200

    except Exception as e:
        print("❌ Error clearing records:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# 🗑️ DELETE: Delete single issue by ID
# ==========================================
@app.route('/api/issues/<int:issue_id>', methods=['DELETE'])
def delete_issue(issue_id):
    """Delete a single issue by ID"""
    try:
        db = get_db_connection()
        cursor = db.cursor()
        placeholder = "%s" if USE_TIDB else "?"

        # Delete the issue
        cursor.execute(
            f"DELETE FROM Issues WHERE issue_id = {placeholder}",
            (issue_id,)
        )
        db.commit()

        if cursor.rowcount == 0:
            cursor.close()
            db.close()
            return jsonify({"success": False, "message": "Issue not found"}), 404

        print(f"🗑️ Issue #{issue_id} deleted successfully", flush=True)
        cursor.close()
        db.close()

        return jsonify({
            "success": True,
            "message": f"Issue #{issue_id} deleted successfully"
        }), 200

    except Exception as e:
        print("❌ Error deleting issue:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# 📊 ANALYTICS: Detailed statistics
# ==========================================
@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get comprehensive analytics and statistics"""
    try:
        db = get_db_connection()
        if USE_TIDB:
            cursor = db.cursor(dictionary=True)
        else:
            cursor = db.cursor()

        # Get status breakdown
        cursor.execute("SELECT status, COUNT(*) as count FROM Issues GROUP BY status")
        status_data = cursor.fetchall()
        if not USE_TIDB:
            status_data = [dict(row) for row in status_data]

        # Get category breakdown
        cursor.execute("SELECT category, COUNT(*) as count FROM Issues GROUP BY category")
        category_data = cursor.fetchall()
        if not USE_TIDB:
            category_data = [dict(row) for row in category_data]

        # Get priority breakdown
        cursor.execute("SELECT priority, COUNT(*) as count FROM Issues GROUP BY priority")
        priority_data = cursor.fetchall()
        if not USE_TIDB:
            priority_data = [dict(row) for row in priority_data]

        # Get worker stats
        cursor.execute("SELECT worker, COUNT(*) as count FROM Issues WHERE worker IS NOT NULL GROUP BY worker")
        worker_data = cursor.fetchall()
        if not USE_TIDB:
            worker_data = [dict(row) for row in worker_data]

        # Calculate SLA metrics
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assigned,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress
            FROM Issues
        """)
        summary = cursor.fetchone()
        if not USE_TIDB:
            summary = dict(summary)

        cursor.close()
        db.close()

        return jsonify({
            "success": True,
            "summary": summary,
            "status_breakdown": status_data,
            "category_breakdown": category_data,
            "priority_breakdown": priority_data,
            "worker_stats": worker_data
        }), 200

    except Exception as e:
        print("❌ Error fetching analytics:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# 💬 COMMENTS: Add/Get comments on issues
# ==========================================
@app.route('/api/issues/<int:issue_id>/comments', methods=['GET'])
def get_issue_comments(issue_id):
    """Get all comments for an issue"""
    try:
        db = get_db_connection()
        if USE_TIDB:
            cursor = db.cursor(dictionary=True)
        else:
            cursor = db.cursor()

        cursor.execute(
            "SELECT comment_id, author, message, created_at FROM Comments WHERE issue_id = ? ORDER BY created_at DESC",
            (issue_id,)
        )
        comments = cursor.fetchall()
        if not USE_TIDB:
            comments = [dict(row) for row in comments]

        cursor.close()
        db.close()

        return jsonify({
            "success": True,
            "data": comments
        }), 200

    except Exception as e:
        print("❌ Error fetching comments:", e)
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/issues/<int:issue_id>/comments', methods=['POST'])
def add_issue_comment(issue_id):
    """Add a comment to an issue"""
    try:
        data = request.json or {}
        author = data.get('author', 'Unknown')
        message = data.get('message', '').strip()

        if not message:
            return jsonify({"success": False, "message": "Comment cannot be empty"}), 400

        db = get_db_connection()
        cursor = db.cursor()
        placeholder = "%s" if USE_TIDB else "?"

        cursor.execute(
            f"INSERT INTO Comments (issue_id, author, message) VALUES ({placeholder}, {placeholder}, {placeholder})",
            (issue_id, author, message)
        )
        db.commit()

        print(f"💬 Comment added to issue #{issue_id}", flush=True)
        cursor.close()
        db.close()

        return jsonify({
            "success": True,
            "message": "Comment added successfully"
        }), 201

    except Exception as e:
        print("❌ Error adding comment:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# ==========================================
# 📥 EXPORT: Download issues as CSV
# ==========================================
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export all issues as CSV"""
    try:
        import csv
        from io import StringIO

        db = get_db_connection()
        if USE_TIDB:
            cursor = db.cursor(dictionary=True)
        else:
            cursor = db.cursor()

        query = """
            SELECT i.issue_id, i.title, i.category, i.priority, i.location,
                   i.description, i.status, i.worker, u.name as reporter, i.created_at
            FROM Issues i
            JOIN Users u ON i.reported_by = u.user_id
            ORDER BY i.created_at DESC
        """
        cursor.execute(query)
        issues = cursor.fetchall()

        if not USE_TIDB:
            issues = [dict(row) for row in issues]

        # Create CSV
        output = StringIO()
        fieldnames = ['ID', 'Title', 'Category', 'Priority', 'Location', 'Description', 'Status', 'Worker', 'Reporter', 'Created']
        writer = csv.DictWriter(output, fieldnames=fieldnames)

        writer.writeheader()
        for issue in issues:
            writer.writerow({
                'ID': issue.get('issue_id'),
                'Title': issue.get('title'),
                'Category': issue.get('category'),
                'Priority': issue.get('priority'),
                'Location': issue.get('location'),
                'Description': issue.get('description'),
                'Status': issue.get('status'),
                'Worker': issue.get('worker', ''),
                'Reporter': issue.get('reporter'),
                'Created': issue.get('created_at')
            })

        cursor.close()
        db.close()

        print(f"📥 Exported {len(issues)} issues to CSV", flush=True)

        return output.getvalue(), 200, {
            'Content-Disposition': 'attachment; filename=issues_export.csv',
            'Content-Type': 'text/csv'
        }

    except Exception as e:
        print("❌ Error exporting CSV:", e)
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
    print("🚀 Flask Backend running at http://localhost:5000")
    app.run(debug=True, host=os.getenv("FLASK_HOST", "0.0.0.0"), port=5000)

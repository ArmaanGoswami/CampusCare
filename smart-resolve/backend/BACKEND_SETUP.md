# 🔧 Backend Setup Guide

## Running the Smart Resolve Backend

### **Prerequisites**
- Python 3.8+
- Virtual environment activated

---

## **Setup Steps**

### **1. Install Dependencies**
```bash
cd smart-resolve/backend
pip install -r requirements.txt
```

### **2. Configure Google Sheets Credentials**

#### **Option A: Use Default Credentials (Armaan)**
Just use the existing `credentials.json` file - no extra setup needed!

```bash
python app.py
```

#### **Option B: Use Your Own Credentials (Friend/Collaborator)**

**Step 1:** Follow the guide in `CREDENTIALS_SETUP_GUIDE.md` to create your own Google Cloud Service Account

**Step 2:** Save your credentials.json (or rename it):
```bash
# Copy your credentials file to backend folder
cp ~/Downloads/credentials.json smart-resolve_friend_creds.json
```

**Step 3:** Create a `.env` file in `smart-resolve/backend/`:
```bash
# Copy the example
cp .env.example .env

# Edit .env and set your credentials file path
# Edit .env with your editor and add:
GOOGLE_CREDENTIALS_FILE=smart-resolve_friend_creds.json
GOOGLE_SHEET_ID=1F-Kp2sQQWRhJfSlBdeVb75D2vqjmlV1TZ931IfTQk-A
```

**Step 4:** Run backend:
```bash
python app.py
```

---

## **Alternative: Using Environment Variables**

### **Windows Command Prompt**
```batch
set GOOGLE_CREDENTIALS_FILE=C:\path\to\credentials_friend.json
python app.py
```

### **Windows PowerShell**
```powershell
$env:GOOGLE_CREDENTIALS_FILE = "C:\path\to\credentials_friend.json"
python app.py
```

### **Linux/Mac**
```bash
export GOOGLE_CREDENTIALS_FILE=/path/to/credentials_friend.json
python app.py
```

---

## **Project Structure**

```
smart-resolve/backend/
├── app.py                    # Main Flask application
├── credentials.json          # Default Armaan's credentials (DO NOT COMMIT)
├── credentials_friend.json   # Friend's credentials (example)
├── .env                      # Environment variables (DO NOT COMMIT)
├── .env.example              # Example .env file
├── requirements.txt          # Python dependencies
├── smart_resolve.db          # SQLite database
├── uploads/                  # Uploaded photos directory
├── format_sheets.py          # Utility for Google Sheets
└── sheets_debug.log          # Debug logs
```

---

## **Available Configuration**

All these can be set in `.env` file or as environment variables:

```python
# Google Sheets
GOOGLE_CREDENTIALS_FILE=credentials.json
GOOGLE_SHEET_ID=1F-Kp2sQQWRhJfSlBdeVb75D2vqjmlV1TZ931IfTQk-A

# Database (optional - for TiDB)
TIDB_PASSWORD=your_password

# AI Features (optional - Hugging Face)
HF_TOKEN=your_token

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
```

---

## **API Endpoints**

### **Report Issue**
```
POST /api/report
Content-Type: multipart/form-data

Fields:
- title (string)
- category (string)
- priority (string)
- location (string)
- description (string)
- reporter (string)
- photos (files - up to 4 images)
```

### **Get All Issues**
```
GET /api/issues
Response: JSON array of issues with photos
```

### **Get Issue Photos**
```
GET /api/issues/<issue_id>/photos
Response: Array of photo URLs
```

### **Serve Photos**
```
GET /uploads/<filename>
Response: Image file
```

---

## **Troubleshooting**

### **"Service account not found" Error**
- Ensure the sheet is shared with your service account email
- Check that the email in credentials.json is correct
- Wait 2-3 minutes for Google to sync permissions

### **"GOOGLE_CREDENTIALS_FILE not found" Error**
- Check the path is correct (absolute or relative to backend folder)
- Ensure the JSON file is valid

### **"Unable to connect to database" Error**
- SQLite is used by default (TIDB not configured)
- If database is corrupted, delete `smart_resolve.db` and restart

### **Photos not uploading**
- Check `uploads/` directory exists
- Ensure write permissions on backend directory
- Check logs in `sheets_debug.log`

---

## **Development Tips**

### **View Logs**
```bash
tail -f sheets_debug.log
```

### **Debug Mode**
Backend runs with `FLASK_DEBUG=True` by default when `.env` is set

### **Database Query**
```python
import sqlite3
db = sqlite3.connect('smart_resolve.db')
cursor = db.cursor()
cursor.execute("SELECT * FROM Issues")
print(cursor.fetchall())
```

---

## **🔒 Security Notes**

- ✅ Never commit `credentials.json` or `.env` files (already in .gitignore)
- ✅ Keep credentials.json private
- ✅ Use environment variables in production
- ✅ Rotate credentials periodically
- ✅ Use least-privilege IAM roles

---

## **Questions?**

Contact Armaan! 🚀

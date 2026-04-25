# Google Sheets Formatter - Setup headers, formatting, freezing
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
import os
import json

# Column definitions with formatting
HEADERS = ["Date/Time", "Student Name", "Department", "Priority", "Issue", "Location", "Status"]

# SHEET ID - Update this with your actual Google Sheet ID
# Get from: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "1F-Kp2sQQWRhJfSlBdeVb75D2vqjmlV1TZ931IfTQk-A")

def get_sheets_service():
    """Authenticate and get Google Sheets service"""
    # Use service account credentials or OAuth flow
    creds_file = os.getenv("GOOGLE_CREDENTIALS_JSON", "credentials.json")
    
    if not os.path.exists(creds_file):
        print(f"❌ Credentials file '{creds_file}' not found!")
        print("📝 Setup instructions:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Create Service Account with Sheets API access")
        print("3. Download JSON credentials")
        print("4. Save as 'backend/credentials.json'")
        print("5. Share Google Sheet with service account email")
        return None
    
    credentials = Credentials.from_service_account_file(
        creds_file,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def format_sheet():
    """Add headers and apply formatting"""
    service = get_sheets_service()
    if not service:
        return False
    
    try:
        # Define formatting requests - simplified for reliability
        requests = [
            # 1. Add headers to first row
            {
                "updateCells": {
                    "rows": [{
                        "values": [
                            {"userEnteredValue": {"stringValue": header}}
                            for header in HEADERS
                        ]
                    }],
                    "fields": "userEnteredValue",
                    "range": {
                        "sheetId": 0,
                        "startRowIndex": 0,
                        "startColumnIndex": 0
                    }
                }
            },
            # 2. Freeze header row
            {
                "updateSheetProperties": {
                    "properties": {
                        "sheetId": 0,
                        "gridProperties": {
                            "frozenRowCount": 1
                        }
                    },
                    "fields": "gridProperties.frozenRowCount"
                }
            },
            # 3. Set column widths
            {
                "updateDimensionProperties": {
                    "range": {
                        "sheetId": 0,
                        "dimension": "COLUMNS",
                        "startIndex": 0,
                        "endIndex": len(HEADERS)
                    },
                    "properties": {
                        "pixelSize": 150
                    },
                    "fields": "pixelSize"
                }
            }
        ]
        
        # Execute all formatting requests
        body = {"requests": requests}
        result = service.spreadsheets().batchUpdate(
            spreadsheetId=SHEET_ID,
            body=body
        ).execute()
        
        print("✅ Sheet formatted successfully!")
        print(f"📊 Applied {len(requests)} formatting changes")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Formatting Google Sheets...")
    format_sheet()

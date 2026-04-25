# Google Sheets API Setup Guide

## 🔑 Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis)
2. Create a new project: "Smart Resolve"
3. Search for "Google Sheets API" → Click it → Enable

## 🔐 Step 2: Create Service Account

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Name: `smart-resolve-sheets`
4. Click **Create and Continue**
5. Grant role: **Editor**
6. Click **Continue** → **Done**

## 📥 Step 3: Download Credentials

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Download the file

## 📁 Step 4: Place Credentials

1. Place downloaded JSON file as: `smart-resolve/backend/credentials.json`

## 🔗 Step 5: Share Sheet with Service Account

1. Open downloaded credentials.json
2. Find the `client_email` (looks like: `abc@project.iam.gserviceaccount.com`)
3. Go to your Google Sheet
4. Click **Share**
5. Paste the email and give **Editor** access

## ▶️ Step 6: Run Formatter

```bash
cd smart-resolve/backend
python format_sheets.py
```

## ✅ Done!

Your sheet will now have:
- ✓ Proper headers with blue background
- ✓ Frozen header row
- ✓ Formatted columns  
- ✓ Dropdown validation for Priority & Status
- ✓ Better column widths

---

**Need Help?** Check the error messages in the terminal for specific issues.

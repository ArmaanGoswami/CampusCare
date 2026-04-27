# 🔐 Google Sheets Credentials Setup Guide

## For Friend/Collaborators - Create Your Own Service Account

यह guide अगर आप अपना service account बनाना चाहते हैं (सबसे सुरक्षित तरीका)

---

## **Step 1: Google Cloud Console खोलो**

👉 जाओ: https://console.cloud.google.com

---

## **Step 2: नया Project बनाओ**

1. **Project** dropdown दबाओ (ऊपर बाईं ओर)
2. **New Project** दबाओ
3. Project का नाम दो: `smart-resolve-friend` (या कुछ और)
4. **Create** दबाओ

---

## **Step 3: Google Sheets API Enable करो**

1. Search bar में जाओ और लिखो: `Google Sheets API`
2. Result में **Google Sheets API** को select करो
3. **ENABLE** बटन दबाओ

---

## **Step 4: Service Account बनाओ**

1. बाईं ओर **IAM & Admin** → **Service Accounts** खोलो
2. **CREATE SERVICE ACCOUNT** दबाओ
3. Service Account का नाम दो: `smart-resolve`
4. **CREATE AND CONTINUE** दबाओ
5. **CONTINUE** दबाओ (Grants optional है)
6. **DONE** दबाओ

---

## **Step 5: Key Generate करो**

1. अभी बनाए गए service account को select करो
2. **Keys** tab खोलो
3. **Add Key** → **Create New Key** दबाओ
4. **JSON** select करो
5. **CREATE** दबाओ

✅ एक JSON file download होगा - **यह अपना credentials.json है!**

---

## **Step 6: Service Account Email निकालो**

Downloaded JSON file को खोलो और इस line को खोजो:
```json
"client_email": "smart-resolve@YOUR_PROJECT.iam.gserviceaccount.com"
```

यह email copy करो।

---

## **Step 7: Google Sheet को Share करो**

अब **Armaan का Sheet खोलो**:
https://docs.google.com/spreadsheets/d/1F-Kp2sQQWRhJfSlBdeVb75D2vqjmlV1TZ931IfTQk-A

1. **Share** बटन दबाओ (ऊपर दाहिनी ओर)
2. Step 6 में copied email को paste करो
3. Permission: **Editor** दो
4. **Share** दबाओ

---

## **Step 8: अपना Credentials.json Project में रखो**

```bash
# अपने project folder में जाओ
cd c:\path\to\college complaint\smart-resolve\backend

# Downloaded JSON file को यहाँ रखो
# नाम: credentials_friend.json (या कोई और)
```

---

## **Step 9: Backend को अपने Credentials बताओ**

### **Option A: Windows Command Line**
```bash
set GOOGLE_CREDENTIALS_FILE=C:\path\to\smart-resolve\backend\credentials_friend.json
cd "c:\path\to\smart-resolve\backend"
python app.py
```

### **Option B: .env File (Better)**

1. `smart-resolve/backend/` में `.env` file बनाओ
2. यह लिखो:
```
GOOGLE_CREDENTIALS_FILE=credentials_friend.json
```

3. Backend को run करो:
```bash
cd "c:\path\to\smart-resolve\backend"
python app.py
```

### **Option C: PowerShell**
```powershell
$env:GOOGLE_CREDENTIALS_FILE = "C:\full\path\to\credentials_friend.json"
cd "c:\path\to\smart-resolve\backend"
python app.py
```

---

## **Step 10: Test करो**

1. Frontend start करो:
```bash
cd "c:\path\to\smart-resolve"
npm run dev
```

2. Backend start करो (अपने credentials के साथ):
```bash
cd "c:\path\to\smart-resolve\backend"
python app.py
```

3. कोई complaint submit करो → **Sheet में entry हो जाएगी!** ✅

---

## **🔒 Security Checklist**

- ✅ अपना service account email दो (full project access नहीं)
- ✅ Armaan के Google Cloud Project को access न करने दो
- ✅ अपना credentials.json safe रखो (GitHub पर push न करो!)
- ✅ अगर कभी चाहे तो Armaan Sheet से remove कर सकता है

---

## **❓ अगर Problem आए**

### **Error: "Service account not found"**
- Ensure sheet को service account email से share किया है
- Wait करो 2-3 मिनट

### **Error: "Unable to load credentials"**
- GOOGLE_CREDENTIALS_FILE path सही है का check करो
- Path में spaces हो तो quotes लगाओ: `"C:\Path With Spaces\credentials.json"`

### **Error: "Sheet ID not found"**
- Sheet का ID सही है का check करो
- या Armaan से पूछो 😊

---

## **📞 Questions?**

Armaan से contact करो! 🚀

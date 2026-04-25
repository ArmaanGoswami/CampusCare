@echo off
REM Smart Resolve Google Sheets Formatter - One Click Setup
REM Run this AFTER placing credentials.json in backend folder

echo.
echo ========================================
echo   Google Sheets Formatter Setup
echo ========================================
echo.

cd /d "%~dp0"

REM Check if credentials.json exists
if not exist "smart-resolve\backend\credentials.json" (
    echo.
    echo ERROR: credentials.json not found!
    echo.
    echo Please follow these steps:
    echo 1. Go to SHEETS_SETUP.md for detailed instructions
    echo 2. Download your Google Cloud Service Account credentials
    echo 3. Save it as 'smart-resolve\backend\credentials.json'
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✓ Found credentials.json
echo.
echo Installing required packages...
cd smart-resolve\backend
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client -q

echo.
echo Running Sheet formatter...
echo.
python format_sheets.py

echo.
echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo   ✅ SUCCESS! Your sheet is formatted
    echo ========================================
) else (
    echo ========================================
    echo   ❌ ERROR! Check the messages above
    echo ========================================
)

echo.
pause

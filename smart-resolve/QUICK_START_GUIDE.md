# Smart Resolve - Installation & Quick Start Guide

## System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 4GB (8GB recommended)
- **Storage**: 500MB free space
- **Processor**: Dual-core 2GHz+

### Software Prerequisites
| Software | Version | Download |
|----------|---------|----------|
| Python | 3.8+ | python.org |
| Node.js | 16+ | nodejs.org |
| Git | 2.30+ | git-scm.com |
| npm | 8+ | Included with Node.js |

---

## Step-by-Step Installation

### Windows Installation

#### 1. Install Python
```bash
# Download from python.org
# Run installer with "Add Python to PATH" checked
# Verify installation
python --version
pip --version
```

#### 2. Install Node.js
```bash
# Download from nodejs.org
# Run installer with npm selected
# Verify installation
node --version
npm --version
```

#### 3. Clone Project
```bash
cd c:\
git clone <your-repo-url> "college complaint"
cd "college complaint"
```

#### 4. Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate

# Install dependencies
cd smart-resolve\backend
pip install -r requirements.txt

# Verify Flask installed
python -c "import flask; print(flask.__version__)"
```

#### 5. Frontend Setup
```bash
# Navigate to frontend directory
cd ..\..

# Install npm dependencies
npm install

# Verify Vite installed
npm list vite
```

#### 6. Run Application

**Terminal 1 - Backend:**
```bash
cd smart-resolve\backend
python app.py
# Output: Running on http://127.0.0.1:5000
```

**Terminal 2 - Frontend:**
```bash
cd smart-resolve
npm run dev
# Output: VITE v... ready in ... ms
# ➜  Local:   http://localhost:5173/
```

#### 7. Access Application
- Open browser: `http://localhost:5173`
- You should see the login page with campus background

---

### macOS Installation

#### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Python & Node.js
```bash
brew install python@3.11
brew install node

python3 --version
node --version
```

#### 3. Clone & Setup
```bash
cd ~
git clone <your-repo-url>
cd "college complaint"

# Backend
python3 -m venv venv
source venv/bin/activate
cd smart-resolve/backend
pip install -r requirements.txt

# Frontend
cd ..
npm install
```

#### 4. Run
```bash
# Terminal 1
cd smart-resolve/backend && python3 app.py

# Terminal 2
cd smart-resolve && npm run dev
```

---

### Linux (Ubuntu) Installation

```bash
# Update package manager
sudo apt update

# Install Python
sudo apt install python3-pip python3-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Clone and setup
git clone <your-repo-url>
cd college\ complaint

# Backend
python3 -m venv venv
source venv/bin/activate
cd smart-resolve/backend
pip install -r requirements.txt

# Frontend
cd ..
npm install

# Run (as above)
```

---

## First-Time Usage

### 1. Login as Student
1. Open `http://localhost:5173`
2. Click **STUDENT** tab
3. Enter any roll number (e.g., "20CS001")
4. Enter any password
5. Click **LOGIN**

### 2. Submit Your First Complaint
1. Click **Report Issue**
2. Fill in details:
   - **Title**: "Classroom needs repair"
   - **Description**: "Ceiling fan is broken in Room 101"
   - **Category**: Select "Facilities"
   - **Priority**: "High"
3. Click **SUBMIT**
4. Note the Issue ID shown

### 3. Track Your Issue
1. Go to **Track Issue** tab
2. You should see your submitted complaint
3. Status shows as "Pending"

### 4. Login as Admin
1. Logout (if needed)
2. Click **ADMIN** tab
3. Enter any admin code
4. Enter any password
5. Click **LOGIN**

### 5. View All Issues
1. You're in **Admin Dashboard**
2. See all submitted issues
3. Click on an issue to expand details

### 6. Update Issue Status
1. Click on your test issue
2. Update status to "In Progress"
3. Assign to yourself as worker
4. Add comment "We're on it!"
5. Click **UPDATE**

### 7. View Analytics
1. Click **Analytics** (in admin view)
2. See statistics:
   - Total issues: 1
   - Resolved: 0
   - Your performance: 1 issue handled

---

## Verification Checklist

- [ ] Python installed and in PATH
- [ ] Node.js installed and in PATH
- [ ] Virtual environment created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can login as student
- [ ] Can login as admin
- [ ] Can submit issue
- [ ] Can view issue
- [ ] Can update issue
- [ ] Analytics page loads
- [ ] Can export to CSV

---

## Troubleshooting

### Problem: "Python command not found"
**Solution:**
```bash
# Windows: Add to PATH
# Check: python --version

# macOS/Linux:
python3 --version
alias python=python3
```

### Problem: "npm: command not found"
**Solution:**
```bash
# Reinstall Node.js from nodejs.org
# Verify: npm --version
```

### Problem: "Port 5000 already in use"
**Windows:**
```bash
# Find process
netstat -ano | findstr :5000
# Kill process
taskkill /PID <PID> /F

# Or use different port
# Edit app.py: app.run(port=5001)
```

**macOS/Linux:**
```bash
# Find and kill
lsof -i :5000
kill -9 <PID>
```

### Problem: "Port 5173 already in use"
```bash
npm run dev -- --port 5174
```

### Problem: "ModuleNotFoundError: No module named 'flask'"
```bash
# Activate virtual environment
# Windows:
.\.venv\Scripts\Activate

# macOS/Linux:
source venv/bin/activate

# Install again
pip install -r requirements.txt
```

### Problem: "CORS error in browser console"
**Check:**
1. Backend is running
2. Frontend URL matches in CORS config
3. Ports are correct (5000 for backend, 5173 for frontend)

### Problem: "Database locked"
```bash
# Remove database and restart
rm smart-resolve/backend/smart_resolve.db
python app.py
```

### Problem: "SQLite database is locked"
```bash
# Windows:
taskkill /IM python.exe /F

# macOS/Linux:
pkill -f "python.*app.py"

# Then restart
python app.py
```

---

## Common Commands

### Backend Commands
```bash
# Activate virtual environment
.\.venv\Scripts\Activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py

# Run with specific port
python -c "from app import app; app.run(port=5001)"

# Create database
python -c "from app import db; db.create_all()"
```

### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

### Git Commands
```bash
# Clone repository
git clone <url>

# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message"

# Push to remote
git push origin main

# Pull latest
git pull origin main
```

---

## Development Workflow

### Daily Workflow
```
1. Morning: Pull latest changes
   git pull origin main

2. Throughout day: Make changes
   Edit files → Save → Browser auto-refreshes

3. End of day: Commit and push
   git add .
   git commit -m "Descriptive message"
   git push origin main
```

### Feature Development
```
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Edit, test, verify

# Commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# Request review → Merge

# Back to main
git checkout main
git pull origin main
```

---

## Environment Setup

### Creating .env File (Optional)
```bash
# .env file in project root
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///smart_resolve.db
CORS_ORIGINS=http://localhost:5173
```

### Using .env in Python
```python
from dotenv import load_dotenv
import os

load_dotenv()
FLASK_ENV = os.getenv('FLASK_ENV', 'production')
```

---

## Production Build

### Build Frontend
```bash
cd smart-resolve
npm run build

# Output in dist/ folder
# Upload to web server
```

### Build Backend
```bash
# No build needed, just ensure requirements installed
pip install -r requirements.txt

# Can use production server like Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## Performance Testing

### Check Frontend Performance
```bash
# Lighthouse audit
npm run build
npm run preview  # Check on localhost:4173
```

### Check Backend Performance
```bash
# API response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/issues
```

### Load Testing (Optional)
```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: sudo apt install apache2-utils

# Run load test
ab -n 100 -c 10 http://localhost:5000/api/issues
```

---

## Next Steps

After successful installation:

1. ✅ **Explore Features**: Try all functionality
2. 📚 **Read Documentation**: Full guides in PROJECT_DOCUMENTATION.md
3. 💾 **Make Backup**: Save working state
4. 🔧 **Customize**: Modify for your needs
5. 🚀 **Deploy**: Push to production

---

## Support & Resources

### Documentation Files
- `PROJECT_DOCUMENTATION.md` - Complete guide
- `TECHNICAL_ARCHITECTURE.md` - System design
- `README.md` - Project overview

### Helpful Links
- Flask Docs: flask.palletsprojects.com
- React Docs: react.dev
- Vite Docs: vitejs.dev
- SQLite Docs: sqlite.org

### Video Tutorials
- Watch YouTube for similar projects
- Flask REST API tutorials
- React basics and advanced

---

## Getting Help

**If something doesn't work:**
1. Check error message carefully
2. Search in troubleshooting section
3. Check log files
4. Try restarting services
5. Contact support/developer

**For bugs:**
1. Describe the issue
2. Provide error message
3. List steps to reproduce
4. Share system information

---

## Quick Reference Card

```
QUICK START
═══════════════════════════════════════════════════════════

1. CLONE PROJECT
   git clone <url>
   cd "college complaint"

2. INSTALL DEPENDENCIES
   python -m venv .venv
   .\.venv\Scripts\Activate    (Windows)
   cd smart-resolve\backend
   pip install -r requirements.txt
   cd ..\..
   npm install

3. START BACKEND (Terminal 1)
   cd smart-resolve\backend
   python app.py
   → Running on http://localhost:5000

4. START FRONTEND (Terminal 2)
   cd smart-resolve
   npm run dev
   → Open http://localhost:5173

5. ACCESS APPLICATION
   Browser: http://localhost:5173
   Login: Any credentials
   Click STUDENT or ADMIN tab

═══════════════════════════════════════════════════════════
COMMON ERRORS & FIXES
• "Port in use" → Change port or kill process
• "Module not found" → Activate venv, run pip install
• "CORS error" → Check ports and URLs
• "Database locked" → Restart backend

═══════════════════════════════════════════════════════════
```

---

**Installation Guide Version**: 1.0
**Last Updated**: April 2026
**Status**: ✅ Verified and Tested


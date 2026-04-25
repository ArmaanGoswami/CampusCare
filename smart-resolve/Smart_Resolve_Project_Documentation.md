# Smart Resolve - Project Documentation

## 1. Project Overview
**Smart Resolve** is a comprehensive campus complaint management application designed to efficiently handle, track, and resolve various issues across a college campus or organization. It provides distinct interfaces for standard users (students/staff) to report issues and track their progress, and for administrators to manage and assign those tickets.

## 2. Technical Stack
The project is built using a modern, decoupled architecture:
- **Frontend Framework:** React (using Vite for fast build tooling)
- **Mobile Wrapper:** Capacitor (to package the React web app into a native Android APK)
- **Backend Framework:** Python with Flask & Flask-CORS
- **Database:** TiDB (Cloud MySQL database) for production, with an automatic fallback to local SQLite for development if no database credentials are provided.
- **AI Integration:** HuggingFace Serverless Inference API (facebook/bart-large-mnli) for predicting text, categorization, and routing of issues.

## 3. System Architecture
### 3.1 Client-Side (Frontend)
The frontend is a Single Page Application (SPA) driven by React state (`App.jsx`). The app seamlessly switches between four primary views based on user login and role:
1. **Report:** For standard users to submit a new complaint.
2. **My Reports:** For standard users to view the status of complaints they've opened.
3. **Manage (Admin):** For admins to survey all incoming complaints across the system and assign them to workers or mark them as resolved.
4. **Analytics (Admin):** For admins to view aggregate data and metrics about the system.

*Data flow constraint:* The frontend polls the backend continuously to keep local state synced, while initially populating with `localStorage` objects or seed data for offline resilience. API base routing (`src/config/api.js`) adapts depending on if the app is run locally, via network, or from an Android emulator.

### 3.2 Server-Side (Backend)
The backend is a Flask API server (`backend/app.py`). It acts as a bridge between the Frontend interface and the persistent Database layer. The server natively listens on `0.0.0.0:5000` to allow local-network access, allowing real-world mobile devices connected to the same Wi-Fi to reach it.

### 3.3 Database Schema
The database (whether MySQL or SQLite) relies on two primary tables holding relational data:

**Table `Users`**
- `user_id` (Primary Key, Auto Increment)
- `name` (String, required)
- `role` (String, default: 'User')

**Table `Issues`**
- `issue_id` (Primary Key, Auto Increment)
- `reported_by` (Foreign Key -> `Users.user_id`)
- `title` (String, required)
- `category` (String, required)
- `priority` (String, required)
- `location` (String, required)
- `description` (Text, required)
- `status` (String, default: 'Pending')
- `created_at` (Timestamp, defaults to current time)

## 4. API Core Endpoints
| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Checks basic availability and returns a map of all available routes. |
| `GET` | `/health` | In-depth system health check, covering Database bindings and AI readiness. |
| `POST` | `/api/report` | Allows the frontend to submit a new issue. It registers the reporter dynamically if they don't already exist in the Users database. |
| `GET` | `/api/issues` | Retrieves all tracking tickets. It performs an inner join with the `Users` table to resolve the reporter’s name for admin ease-of-use. |
| `PUT` | `/api/issues/<issue_id>/status` | Updates the status flag of an ongoing ticket (e.g., changes status to `Assigned`, or `Resolved`). |

## 5. Development & Setup Guide
If developers need to set up the project locally for the first time, here are the steps:

### Prerequisites
- Node.js & npm (for the frontend)
- Python 3.x (for the backend)
- Android Studio (optional, needed only to emulate/build the Mobile `.apk`)

### Easy Start scripts
From the parent project directory (`c:\PROJECTS\college complaint\smart-resolve`), Windows users can execute:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-old-app.ps1
```
*(This command binds and opens both frontend and backend automatically at once).*

### Manual Frontend Setup
```bash
cd smart-resolve
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`*

### Manual Backend Setup
```bash
cd smart-resolve/backend
pip install -r requirements.txt
python app.py
```
*Backend runs at `http://localhost:5000`*

### Native Mobile App Setup
Capacitor ties the Web code to the Android platform natively. From the `smart-resolve` directory:
```bash
npm run mobile:sync
npm run mobile:open
```
*This synchronizes the Vite build with Capacitor, and opens the wrapped source files directly in Android Studio for emulation or APK generation.*

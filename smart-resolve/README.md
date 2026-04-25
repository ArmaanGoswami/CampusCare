# Smart Resolve

Campus complaint management app with:
- Frontend: React + Vite
- Backend: Flask + MySQL
- Mobile wrapper: Capacitor (Android)

## Quick Start (Old App UI)

From `smart-resolve` folder, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-old-app.ps1
```

This opens two terminals and starts:
- Backend on `http://localhost:5000`
- Frontend on Vite URL (usually `http://localhost:5173` or `http://localhost:5174`)

To stop both quickly:

```powershell
powershell -ExecutionPolicy Bypass -File .\stop-old-app.ps1
```

## 1) Web setup

From `smart-resolve` folder:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 2) Backend setup

From `smart-resolve/backend` folder, run Flask app in your venv:

```bash
python app.py
```

Backend runs at `http://localhost:5000`.

Backend now listens on `0.0.0.0` by default, so real devices on same Wi-Fi can connect using your laptop IP.

## 3) Mobile app setup (Android)

Capacitor files and Android project are already added.

From `smart-resolve` folder:

```bash
npm run mobile:sync
npm run mobile:open
```

This opens Android Studio. Then run on emulator/device from Android Studio.

## API base URL behavior

Frontend now chooses API URL automatically:
- Web browser: `http://localhost:5000`
- Native Android app (emulator): `http://10.0.2.2:5000`

Optional override via env variable:

```bash
VITE_API_BASE_URL=http://YOUR_IP:5000
```

Create `.env` in `smart-resolve` and set this value when testing on a real phone.

## Helpful mobile commands

```bash
npm run mobile:doctor
npm run mobile:sync
npm run mobile:open
```

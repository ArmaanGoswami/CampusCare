import React, { useEffect, useMemo, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import ReportIssue from './ReportIssue';
import IssueTracker from './IssueTracker';
import LoginPage from './LoginPage';

const STORAGE_KEY = 'smart-resolve-issues-v1';
const DEFAULT_REPORTER = 'Armaan';

const mergeIssuesById = (baseIssues, incomingIssues) => {
  const map = new Map(baseIssues.map((issue) => [issue.id, issue]));

  incomingIssues.forEach((issue) => {
    const existing = map.get(issue.id);
    const incomingStatus = issue.status || existing?.status || 'Pending';
    const shouldKeepExistingStatus = existing
      && existing.status
      && existing.status !== 'Pending'
      && incomingStatus === 'Pending';

    const mergedStatus = shouldKeepExistingStatus ? existing.status : incomingStatus;
    const mergedWorker = mergedStatus === 'Pending'
      ? undefined
      : (issue.worker || existing?.worker);

    map.set(issue.id, {
      ...existing,
      ...issue,
      status: mergedStatus,
      worker: mergedWorker,
      photos: issue.photos || existing?.photos || []
    });
  });

  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

const seedIssues = [
  {
    id: 101,
    title: 'AC leaking in Lab 3',
    category: 'Plumbing',
    priority: 'High',
    location: 'Lab 3, Block A',
    description: 'Water is dripping continuously from AC unit near workstation area.',
    status: 'Pending',
    reporter: 'Aman',
    photos: []
  },
  {
    id: 102,
    title: 'Wi-Fi router dead',
    category: 'IT',
    priority: 'Medium',
    location: 'Library 1st floor',
    description: 'Router not powering on and network is unavailable in study section.',
    status: 'Pending',
    reporter: 'Priya',
    photos: []
  },
  {
    id: 103,
    title: 'Street light not working',
    category: 'Electrical',
    priority: 'Medium',
    location: 'Main pathway gate to canteen',
    description: 'Pathway gets too dark after evening due to dead light.',
    status: 'Assigned',
    reporter: 'Ankit',
    worker: 'Ramesh',
    photos: []
  },
  {
    id: 104,
    title: 'Broken desk in Room 4',
    category: 'Carpentry',
    priority: 'Low',
    location: 'Classroom 4',
    description: 'One leg of desk is broken and unstable.',
    status: 'Resolved',
    reporter: 'Riya',
    worker: 'Suresh',
    photos: []
  }
];

function App() {
  const [currentView, setCurrentView] = useState('user');
  const [authUser, setAuthUser] = useState(null);
  const [issues, setIssues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : seedIssues;
    } catch (error) {
      console.error('Failed to load issues from storage:', error);
      return seedIssues;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    const syncIssuesFromBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/issues');
        const result = await response.json();

        if (result.success && Array.isArray(result.issues)) {
          setIssues((prev) => mergeIssuesById(prev, result.issues));
        }
      } catch (error) {
        console.error('Backend sync failed:', error);
      }
    };

    syncIssuesFromBackend();
  }, [authUser, currentView]);

  const totalPending = useMemo(
    () => issues.filter((issue) => issue.status === 'Pending').length,
    [issues]
  );

  const isAdmin = authUser?.role === 'admin';

  const handleLogin = (user) => {
    setAuthUser(user);
    setCurrentView(user.role === 'admin' ? 'admin' : 'user');
  };

  const handleLogout = () => {
    setAuthUser(null);
    setCurrentView('user');
  };

  const handleCreateIssue = (payload) => {
    const nextId = payload.id || (issues.length ? Math.max(...issues.map((issue) => issue.id)) + 1 : 101);
    const nextIssue = {
      id: nextId,
      title: payload.title,
      category: payload.category,
      priority: payload.priority,
      location: payload.location,
      description: payload.description,
      status: 'Pending',
      reporter: payload.reporter,
      photos: payload.photos || []
    };

    setIssues((prev) => [nextIssue, ...prev]);
  };

  const handleAssignIssue = (issueId, workerName) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? { ...issue, status: 'Assigned', worker: workerName }
        : issue
    )));
  };

  const handleResolveIssue = (issueId) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? { ...issue, status: 'Resolved' }
        : issue
    )));
  };

  const handleReopenIssue = (issueId) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? { ...issue, status: 'Pending', worker: undefined }
        : issue
    )));
  };

  return (
    <div className="app-shell">
      {!authUser ? <LoginPage onLogin={handleLogin} /> : null}

      {authUser ? (
      <header className="app-topbar">
        <div className="brand-wrap fade-slide-in">
          <div className="brand-mark">SR</div>
          <div>
            <h1 className="brand-title">Smart Resolve</h1>
            <p className="brand-subtitle">{isAdmin ? 'Admin console' : `Welcome, ${authUser.name}`}</p>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="status-pill" aria-label="pending summary">
          <span>Pending</span>
          <strong>{totalPending}</strong>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      ) : null}

      {authUser ? (
      <main key={currentView} className="view-stage fade-slide-in">
        <nav className="nav-switch" aria-label="primary navigation">
          {!isAdmin ? (
            <button
              onClick={() => setCurrentView('user')}
              className={`nav-btn ${currentView === 'user' ? 'active' : ''}`}
            >
              <span className="nav-icon">+</span>
              <span>Report</span>
            </button>
          ) : null}

          {!isAdmin ? (
            <button
              onClick={() => setCurrentView('tracker')}
              className={`nav-btn ${currentView === 'tracker' ? 'active' : ''}`}
            >
              <span className="nav-icon">O</span>
              <span>Track</span>
            </button>
          ) : null}

          {isAdmin ? (
            <button
              onClick={() => setCurrentView('admin')}
              className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
            >
              <span className="nav-icon">#</span>
              <span>Admin ({totalPending})</span>
            </button>
          ) : null}
        </nav>

        {currentView === 'user' && !isAdmin ? (
          <ReportIssue reporter={authUser.name || DEFAULT_REPORTER} onCreateIssue={handleCreateIssue} />
        ) : null}

        {currentView === 'tracker' && !isAdmin ? (
          <IssueTracker issues={issues} reporter={authUser.name || DEFAULT_REPORTER} />
        ) : null}

        {currentView === 'admin' ? (
          <AdminDashboard
            issues={issues}
            onAssignIssue={handleAssignIssue}
            onResolveIssue={handleResolveIssue}
            onReopenIssue={handleReopenIssue}
          />
        ) : null}
      </main>
      ) : null}

      <div className="bg-orb orb-1" aria-hidden="true" />
      <div className="bg-orb orb-2" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
    </div>
  );
}

export default App;

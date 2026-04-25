import React, { useEffect, useMemo, useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import ReportIssue from './ReportIssue';
import IssueTracker from './IssueTracker';
import LoginPage from './LoginPage';
import { apiUrl } from './config/api';

const STORAGE_KEY = 'smart-resolve-issues-v2';
const DEFAULT_REPORTER = 'Armaan';

// Clear all storage keys on app load to start fresh
if (typeof window !== 'undefined') {
  localStorage.removeItem('smart-resolve-issues-v1');
  localStorage.removeItem('smart-resolve-issues');
  localStorage.removeItem('smart-resolve-issues-v2');
}

const normalizeReporterName = (value) => (value || '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase();

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
          // Prefer backend reporter so stale local values don't hide records in My Reports.
          reporter: normalizeReporterName(issue.reporter)
            ? issue.reporter
            : (existing?.reporter || issue.reporter),
      photos: issue.photos || existing?.photos || []
    });
  });

  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

// Removed: Seed data no longer needed - fetching from backend instead
const seedIssues = [];

function App() {
  const [currentView, setCurrentView] = useState('user');
  const [authUser, setAuthUser] = useState(null);
  const [issues, setIssues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load issues from storage:', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  const refreshIssuesFromBackend = async (replaceAll = false) => {
    try {
      const response = await fetch(apiUrl('/api/issues'));
      const result = await response.json();
      const incoming = Array.isArray(result.issues)
        ? result.issues
        : (Array.isArray(result.data) ? result.data : []);

      if (result.success && incoming.length >= 0) {
        // On first load, completely replace with backend data
        if (replaceAll) {
          setIssues(incoming);
        } else {
          setIssues((prev) => mergeIssuesById(prev, incoming));
        }
      }
    } catch (error) {
      console.error('Backend sync failed:', error);
    }
  };

  useEffect(() => {
    if (!authUser) {
      return;
    }

    const timer = setTimeout(() => {
      refreshIssuesFromBackend(true); // Force replace on auth change
    }, 0);

    return () => clearTimeout(timer);
  }, [authUser, currentView]);

  const totalPending = useMemo(
    () => issues.filter((issue) => issue.status === 'Pending').length,
    [issues]
  );

  const isAdmin = authUser?.role === 'admin';

  const handleLogin = (user) => {
    setAuthUser(user);
    setCurrentView(user.role === 'admin' ? 'admin' : 'user');
    // Force refresh from backend on login
    setTimeout(() => refreshIssuesFromBackend(true), 100);
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

    fetch(apiUrl(`/api/issues/${issueId}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Assigned', worker: workerName })
    }).catch((error) => {
      console.error('Failed to persist Assigned status:', error);
    });
  };

  const handleStartWork = (issueId) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? { ...issue, status: 'In Progress' }
        : issue
    )));

    fetch(apiUrl(`/api/issues/${issueId}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'In Progress' })
    }).catch((error) => {
      console.error('Failed to persist In Progress status:', error);
    });
  };

  const handleResolveIssue = (issueId) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? { ...issue, status: 'Resolved' }
        : issue
    )));

    fetch(apiUrl(`/api/issues/${issueId}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' })
    }).catch((error) => {
      console.error('Failed to persist Resolved status:', error);
    });
  };

  const handleReopenIssue = (issueId) => {
    setIssues((prev) => prev.map((issue) => (
      issue.id === issueId
        ? { ...issue, status: 'Pending', worker: undefined }
        : issue
    )));

    fetch(apiUrl(`/api/issues/${issueId}/status`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Pending', worker: '' })
    }).catch((error) => {
      console.error('Failed to persist Pending status:', error);
    });
  };

  const handleDeleteIssue = (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue? This cannot be undone.')) {
      return;
    }

    // Remove from local state immediately
    setIssues((prev) => prev.filter((issue) => issue.id !== issueId));

    // Delete from backend
    fetch(apiUrl(`/api/issues/${issueId}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }).catch((error) => {
      console.error('Failed to delete issue:', error);
      // Refresh to restore if deletion failed
      refreshIssuesFromBackend(true);
    });
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
              <span className="nav-icon">📝</span>
              <span className="nav-label">Report</span>
            </button>
          ) : null}

          {!isAdmin ? (
            <button
              onClick={() => setCurrentView('tracker')}
              className={`nav-btn ${currentView === 'tracker' ? 'active' : ''}`}
            >
              <span className="nav-icon">🔍</span>
              <span className="nav-label">My Reports</span>
            </button>
          ) : null}

          {isAdmin ? (
            <button
              onClick={() => setCurrentView('admin')}
              className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Manage ({totalPending})</span>
            </button>
          ) : null}

          {isAdmin ? (
            <button
              onClick={() => setCurrentView('analytics')}
              className={`nav-btn ${currentView === 'analytics' ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Analytics</span>
            </button>
          ) : null}
        </nav>

        {currentView === 'user' && !isAdmin ? (
          <ReportIssue reporter={authUser.name || DEFAULT_REPORTER} onCreateIssue={handleCreateIssue} />
        ) : null}

        {currentView === 'tracker' && !isAdmin ? (
          <IssueTracker 
            issues={issues} 
            reporter={authUser.name || DEFAULT_REPORTER} 
            onRefresh={refreshIssuesFromBackend}
            onDeleteIssue={handleDeleteIssue}
          />
        ) : null}

        {currentView === 'admin' ? (
          <AdminDashboard
            issues={issues}
            onAssignIssue={handleAssignIssue}
            onStartWork={handleStartWork}
            onResolveIssue={handleResolveIssue}
            onReopenIssue={handleReopenIssue}
            onDeleteIssue={handleDeleteIssue}
            onRefresh={refreshIssuesFromBackend}
          />
        ) : null}

        {currentView === 'analytics' ? (
          <AnalyticsDashboard issues={issues} />
        ) : null}
      </main>
      ) : null}

      <div className="bg-orb orb-1" aria-hidden="true" />
      <div className="bg-orb orb-2" aria-hidden="true" />
      <div className="bg-orb orb-3" aria-hidden="true" />

      <footer className="app-global-footer">
        &copy; 2026 <strong>Smart Resolve</strong> | Built by <strong>Armaan Goswami</strong>
      </footer>
    </div>
  );
}

export default App;

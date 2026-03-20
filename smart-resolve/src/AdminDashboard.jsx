import React, { useState } from 'react';

const AdminDashboard = ({ issues, onAssignIssue, onResolveIssue, onReopenIssue }) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categoryWithEmoji = {
    Plumbing: '🚰 Plumbing',
    IT: '💻 IT',
    Electrical: '⚡ Electrical',
    Carpentry: '🪑 Carpentry'
  };

  const priorityColor = {
    High: '#f87171',
    Medium: '#fb923c',
    Low: '#60a5fa'
  };

  const handleAssign = (issueId) => {
    const workerName = window.prompt("Assign to which worker?");
    if (workerName && workerName.trim()) {
      onAssignIssue(issueId, workerName.trim());
    }
  };

  const filtered = issues.filter((issue) => {
    const normalizedQuery = query.trim().toLowerCase();
    const byCategory = categoryFilter === 'All' || issue.category === categoryFilter;
    const location = issue.location || '';
    const reporter = issue.reporter || '';
    const title = issue.title || '';

    const byQuery = !normalizedQuery
      || title.toLowerCase().includes(normalizedQuery)
      || location.toLowerCase().includes(normalizedQuery)
      || reporter.toLowerCase().includes(normalizedQuery);

    return byCategory && byQuery;
  });

  const pendingIssues = filtered.filter((issue) => issue.status === "Pending");
  const assignedIssues = filtered.filter((issue) => issue.status === "Assigned");
  const resolvedIssues = filtered.filter((issue) => issue.status === "Resolved");
  const categories = ['All', ...new Set(issues.map((issue) => issue.category))];

  const cards = [
    { label: 'Total Tickets', value: issues.length, tone: 'blue' },
    { label: 'Awaiting Action', value: pendingIssues.length, tone: 'amber' },
    { label: 'In Progress', value: assignedIssues.length, tone: 'cyan' },
    { label: 'Completed', value: resolvedIssues.length, tone: 'green' }
  ];

  const IssueCard = ({ issue, index }) => {
    const borderColor = priorityColor[issue.priority] || '#f3f4f6';

    return (
      <article className="admin-issue-card fade-rise" style={{ animationDelay: `${index * 60}ms`, borderLeftColor: borderColor }}>
        <header className="admin-issue-head">
          <span className="admin-issue-id">#{issue.id}</span>
          <span className="admin-issue-category">
            {categoryWithEmoji[issue.category] || issue.category}
          </span>
        </header>

        <h4 className="admin-issue-title">{issue.title}</h4>

        <p className="admin-issue-detail"><strong>Location:</strong> {issue.location || 'Not provided'}</p>
        <p className="admin-issue-detail"><strong>Priority:</strong> {issue.priority || 'Medium'}</p>

        <div className="admin-issue-owner">
          <div className="admin-issue-avatar">
            {issue.status === 'Pending' ? (issue.reporter?.[0] || '?') : (issue.worker?.[0] || '?')}
          </div>
          <div className="admin-issue-owner-text">
            {issue.status === 'Pending' ? (
              <span>Reported by <strong>{issue.reporter || 'Unknown'}</strong></span>
            ) : issue.worker ? (
              <span>Assigned to <strong>{issue.worker}</strong></span>
            ) : (
              <span>Awaiting assignment</span>
            )}
          </div>
        </div>

        {issue.photos?.length ? (
          <p className="admin-issue-photos">{issue.photos.length} photo(s) attached</p>
        ) : null}

        {issue.status === 'Pending' ? (
          <button
            onClick={() => handleAssign(issue.id)}
            className="admin-action-btn assign"
          >
            Assign Worker +
          </button>
        ) : null}

        {issue.status === 'Assigned' ? (
          <button onClick={() => onResolveIssue(issue.id)} className="admin-action-btn resolve">
            Mark Resolved
          </button>
        ) : null}

        {issue.status === 'Resolved' ? (
          <button onClick={() => onReopenIssue(issue.id)} className="admin-action-btn reopen">
            Reopen
          </button>
        ) : null}

      </article>
    );
  };

  const ColumnHeader = ({ title, count, tone }) => (
    <div className="admin-column-header">
      <div className={`admin-column-dot ${tone}`}></div>
      <h3>{title}</h3>
      <span>
        {count}
      </span>
    </div>
  );

  const renderColumn = (title, count, tone, items, emptyText) => (
    <section className="admin-column-panel">
      <ColumnHeader title={title} count={count} tone={tone} />
      <div className="admin-column-list">
        {items.length === 0 ? <p className="empty-note">{emptyText}</p> : null}
        {items.map((issue, index) => <IssueCard key={issue.id} issue={issue} index={index} />)}
      </div>
    </section>
  );

  return (
    <div className="screen-wrap admin-screen">
      <div className="screen-head">
        <div className="admin-head-row">
          <h2>Admin Workspace</h2>
          <span className="admin-version-pill">
            UI v2 LIVE
          </span>
        </div>
        <p>Manage and assign campus issues efficiently</p>
      </div>

      <section className="admin-toolbar">
        <input
          type="search"
          className="tracker-search"
          placeholder="Search by title, location or reporter"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="tracker-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'All' ? 'All Categories' : (categoryWithEmoji[category] || category)}
            </option>
          ))}
        </select>
      </section>

      <section className="stat-strip">
        {cards.map((card) => (
          <article key={card.label} className={`mini-stat ${card.tone}`}>
            <p>{card.label}</p>
            <h4>{card.value}</h4>
          </article>
        ))}
      </section>

      <section className="admin-board-grid">
        {renderColumn('To Do', pendingIssues.length, 'amber', pendingIssues, 'No pending tickets.')}
        {renderColumn('In Progress', assignedIssues.length, 'blue', assignedIssues, 'No active assignments.')}
        {renderColumn('Completed', resolvedIssues.length, 'green', resolvedIssues, 'No completed tickets yet.')}
      </section>
    </div>
  );
};

export default AdminDashboard;

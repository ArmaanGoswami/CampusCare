import React, { useMemo, useState } from 'react';

const statusClassMap = {
  Pending: 'status-tag pending',
  Assigned: 'status-tag assigned',
  'In Progress': 'status-tag progress',
  Resolved: 'status-tag resolved'
};

const normalizeReporterName = (value) => (value || '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase();

const IssueTracker = ({ issues, reporter, onRefresh, onDeleteIssue }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) {
      return;
    }

    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const myIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedReporter = normalizeReporterName(reporter);

    return issues
      .filter((issue) => normalizeReporterName(issue.reporter) === normalizedReporter)
      .filter((issue) => statusFilter === 'All' || issue.status === statusFilter)
      .filter((issue) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          (issue.title || '').toLowerCase().includes(normalizedQuery)
          || (issue.category || '').toLowerCase().includes(normalizedQuery)
          || (issue.location || '').toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => b.id - a.id);
  }, [issues, reporter, statusFilter, query]);

  return (
    <div className="screen-wrap tracker-screen">
      <div className="screen-head">
        <div className="screen-head-row">
          <div>
            <h2>My Reports</h2>
            <p>Track your submitted complaints and their current status.</p>
          </div>
          <button type="button" className="primary-btn" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '⏳ Refreshing…' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      <section className="tracker-toolbar">
        <input
          type="search"
          placeholder="Search by title, category or location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="tracker-search"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="tracker-filter"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </section>

      <section className="tracker-list">
        {myIssues.length === 0 ? (
          <div className="tracker-empty">No reports found for this filter.</div>
        ) : (
          myIssues.map((issue) => (
            <article key={issue.id} className="tracker-card fade-rise">
              <div className="tracker-top-row">
                <h3>#{issue.id} {issue.title}</h3>
                <span className={statusClassMap[issue.status]}>{issue.status}</span>
              </div>

              <div className="tracker-meta-row">
                <span>{issue.category}</span>
                <span>{issue.priority || 'Medium'} Priority</span>
                <span>{issue.location || 'Location not provided'}</span>
              </div>

              <p className="tracker-description">{issue.description || 'No additional description provided.'}</p>

              <div className="tracker-bottom-row">
                <p>
                  {issue.status === 'Pending' ? '⏳ Waiting for assignment' : null}
                  {issue.status === 'Assigned' ? `👷 Assigned to ${issue.worker || 'a worker'}` : null}
                  {issue.status === 'In Progress' ? `🔧 In progress — ${issue.worker || 'worker'} is on it` : null}
                  {issue.status === 'Resolved' ? `✅ Resolved by ${issue.worker || 'team'}` : null}
                </p>
                <p>{issue.photos?.length ? `${issue.photos.length} photo(s)` : 'No photos attached'}</p>
              </div>

              {issue.status === 'Pending' && onDeleteIssue ? (
                <button 
                  onClick={() => onDeleteIssue(issue.id)}
                  className="tracker-delete-btn"
                  title="Delete this complaint"
                >
                  🗑️ Delete
                </button>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default IssueTracker;

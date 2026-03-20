import React, { useMemo, useState } from 'react';

const statusClassMap = {
  Pending: 'status-tag pending',
  Assigned: 'status-tag assigned',
  Resolved: 'status-tag resolved'
};

const IssueTracker = ({ issues, reporter }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');

  const myIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return issues
      .filter((issue) => issue.reporter === reporter)
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
        <h2>My Reports</h2>
        <p>Track your submitted complaints and their current progress.</p>
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
                  {issue.status === 'Pending' ? 'Waiting for assignment' : null}
                  {issue.status === 'Assigned' ? `Assigned to ${issue.worker}` : null}
                  {issue.status === 'Resolved' ? `Resolved by ${issue.worker}` : null}
                </p>
                <p>{issue.photos?.length ? `${issue.photos.length} photo(s)` : 'No photos attached'}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default IssueTracker;

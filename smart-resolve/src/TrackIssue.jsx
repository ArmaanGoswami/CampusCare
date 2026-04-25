import React, { useEffect, useState } from 'react';
import { apiUrl } from './config/api';
import './TrackIssue.css';

const TrackIssue = ({ studentName = 'Armaan' }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      const response = await fetch(apiUrl(`/api/my-issues/${studentName}`));
      const result = await response.json();
      
      if (result.success) {
        setIssues(result.data);
        if (result.data.length > 0) {
          setSelectedIssue(result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueDetails = async (issueId) => {
    try {
      const response = await fetch(apiUrl(`/api/tracker/${issueId}`));
      const result = await response.json();
      return result.issue;
    } catch (error) {
      console.error('Error fetching issue details:', error);
      return null;
    }
  };

  const getProgressPercentage = (status) => {
    const statusMap = {
      'Pending': 25,
      'Assigned': 50,
      'In Progress': 75,
      'Resolved': 100
    };
    return statusMap[status] || 0;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'Pending': '#ff9800',
      'Assigned': '#2196f3',
      'In Progress': '#9c27b0',
      'Resolved': '#4caf50'
    };
    return colorMap[status] || '#665';
  };

  if (loading) {
    return <div className="tracker-container loading">Loading your issues...</div>;
  }

  if (issues.length === 0) {
    return (
      <div className="tracker-container">
        <div className="no-issues">
          <h3>No Issues Yet</h3>
          <p>You haven't submitted any complaints yet.</p>
        </div>
      </div>
    );
  }

  const currentIssue = issues.find(i => i.id === selectedIssue);

  return (
    <div className="tracker-container">
      <h2>📊 Track Your Issues</h2>

      <div className="tracker-grid">
        {/* Issues List */}
        <aside className="issues-list">
          <h3>Your Complaints ({issues.length})</h3>
          <div className="issues-scroll">
            {issues.map(issue => (
              <div
                key={issue.id}
                className={`issue-card ${selectedIssue === issue.id ? 'active' : ''}`}
                onClick={() => setSelectedIssue(issue.id)}
              >
                <div className="issue-header">
                  <span className="issue-id">#{issue.id}</span>
                  <span className="issue-priority" style={{ backgroundColor: getStatusColor(issue.status) }}>
                    {issue.status}
                  </span>
                </div>
                <h4>{issue.title.substring(0, 40)}...</h4>
                <p className="issue-date">{new Date(issue.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Issue Details & Timeline */}
        {currentIssue && (
          <main className="issue-details">
            <div className="detail-card">
              <h3>Issue #{currentIssue.id}: {currentIssue.title}</h3>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="status-badge" style={{ backgroundColor: getStatusColor(currentIssue.status) }}>
                  {currentIssue.status}
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${getProgressPercentage(currentIssue.status)}%`,
                      backgroundColor: getStatusColor(currentIssue.status)
                    }}
                  />
                </div>
                <p className="progress-text">
                  Progress: {getProgressPercentage(currentIssue.status)}%
                </p>
              </div>

              {/* Timeline */}
              <div className="timeline">
                <div className={`timeline-item ${getProgressPercentage(currentIssue.status) >= 25 ? 'completed' : ''}`}>
                  <div className="timeline-dot">⏳</div>
                  <div className="timeline-content">
                    <h4>Pending</h4>
                    <p>Waiting for admin review</p>
                  </div>
                </div>

                <div className="timeline-line" style={{ backgroundColor: getProgressPercentage(currentIssue.status) >= 50 ? getStatusColor(currentIssue.status) : '#ccc' }}></div>

                <div className={`timeline-item ${getProgressPercentage(currentIssue.status) >= 50 ? 'completed' : ''}`}>
                  <div className="timeline-dot">👨‍💼</div>
                  <div className="timeline-content">
                    <h4>Assigned</h4>
                    <p>Assigned to team</p>
                  </div>
                </div>

                <div className="timeline-line" style={{ backgroundColor: getProgressPercentage(currentIssue.status) >= 75 ? getStatusColor(currentIssue.status) : '#ccc' }}></div>

                <div className={`timeline-item ${getProgressPercentage(currentIssue.status) >= 75 ? 'completed' : ''}`}>
                  <div className="timeline-dot">🔧</div>
                  <div className="timeline-content">
                    <h4>In Progress</h4>
                    <p>Team is working on it</p>
                  </div>
                </div>

                <div className="timeline-line" style={{ backgroundColor: getProgressPercentage(currentIssue.status) >= 100 ? getStatusColor(currentIssue.status) : '#ccc' }}></div>

                <div className={`timeline-item ${getProgressPercentage(currentIssue.status) >= 100 ? 'completed' : ''}`}>
                  <div className="timeline-dot">✅</div>
                  <div className="timeline-content">
                    <h4>Resolved</h4>
                    <p>Issue resolved</p>
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div className="details-info">
                <div className="info-row">
                  <label>Category</label>
                  <p>{currentIssue.category}</p>
                </div>
                <div className="info-row">
                  <label>Priority</label>
                  <p>{currentIssue.priority}</p>
                </div>
                <div className="info-row">
                  <label>Location</label>
                  <p>{currentIssue.location}</p>
                </div>
                <div className="info-row">
                  <label>Submitted</label>
                  <p>{new Date(currentIssue.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default TrackIssue;

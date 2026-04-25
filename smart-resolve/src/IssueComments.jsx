import React, { useEffect, useState } from 'react';
import { apiUrl } from './config/api';

const IssueComments = ({ issueId, author }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(apiUrl(`/api/issues/${issueId}/comments`));
      const result = await response.json();
      if (result.success) {
        setComments(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/issues/${issueId}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author || 'Anonymous',
          message: newComment
        })
      });

      if (response.ok) {
        setNewComment('');
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comments-section">
      <h4>💬 Discussion ({comments.length})</h4>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="empty-note">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="comment-item">
              <div className="comment-header">
                <strong>{comment.author}</strong>
                <span className="comment-time">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-text">{comment.message}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="comment-form">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="primary-btn"
          style={{ marginTop: '8px' }}
        >
          {loading ? '⏳ Sending...' : '💬 Post'}
        </button>
      </form>
    </div>
  );
};

export default IssueComments;

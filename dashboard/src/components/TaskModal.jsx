import { useCallback, useEffect, useState } from 'react';
import { formatTime } from '../utils/taskUtils.js';

const STATUS_OPTIONS = ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];

function TaskModal({ task, isOpen, comments, onClose, onLoadComments, onSaveStatus, onAddComment }) {
  const [selectedStatus, setSelectedStatus] = useState('CREATED');
  const [commentText, setCommentText] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [commentsError, setCommentsError] = useState('');

  useEffect(() => {
    if (!isOpen || !task) return;

    const status = (task.status || 'CREATED').toUpperCase();
    setSelectedStatus(status);
    setCommentText('');
    setModalError('');
    setModalSuccess('');
    setCommentsError('');
    setCommentsLoading(false);
    setIsSavingStatus(false);
    setIsSavingComment(false);

    let cancelled = false;

    (async () => {
      setCommentsLoading(true);
      try {
        await onLoadComments(task.id);
        if (!cancelled) {
          setCommentsError('');
        }
      } catch (error) {
        if (!cancelled) {
          setCommentsError(error?.message ? error.message : 'Failed to load comments.');
        }
      } finally {
        if (!cancelled) {
          setCommentsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, task, onLoadComments]);

  const handleClose = useCallback(() => {
    if (isSavingStatus) return;
    onClose();
  }, [isSavingStatus, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleSaveStatus = async () => {
    if (!task || isSavingStatus) return;

    setModalError('');
    setIsSavingStatus(true);

    try {
      await onSaveStatus(task.id, selectedStatus);
      setModalSuccess('הסטטוס עודכן בהצלחה');
    } catch (err) {
      setModalError(err?.message ? err.message : 'Failed to update status.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!task || isSavingComment) return;

    const content = commentText.trim();
    if (!content) {
      setCommentsError('Comment cannot be empty.');
      return;
    }

    setCommentsError('');
    setIsSavingComment(true);

    try {
      await onAddComment(task.id, content);
      setCommentText('');
    } catch (error) {
      setCommentsError(error?.message ? error.message : 'Failed to add comment.');
    } finally {
      setIsSavingComment(false);
    }
  };

  if (!isOpen || !task) {
    return null;
  }

  const statusNorm = (task.status || 'CREATED').toUpperCase();

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="taskModalTitle">
        <div className="modal-header">
          <h3 id="taskModalTitle" className="modal-title">
            {task.title || 'Untitled task'}
          </h3>
          <button
            type="button"
            className="modal-close"
            aria-label="Close task modal"
            onClick={handleClose}
          >
            x
          </button>
        </div>

        <div>
          <p className="modal-meta">
            <strong>Current status:</strong> {statusNorm}
          </p>
          <p className="modal-meta">
            <strong>id:</strong> {task.id || '-'}
          </p>
          <p className="modal-meta">
            <strong>createdAt:</strong> {formatTime(task.createdAt, '-')}
          </p>
          <p className="modal-meta">
            <strong>dueAt:</strong> {formatTime(task.dueAt, 'No due date')}
          </p>
        </div>

        <section className="modal-section">
          <h4>Change status</h4>
          <div className="form-row">
            <label htmlFor="modalStatusSelect">Select new status</label>
            <select
              id="modalStatusSelect"
              value={selectedStatus}
              disabled={isSavingStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-primary"
              disabled={isSavingStatus}
              onClick={handleSaveStatus}
            >
              {isSavingStatus ? 'Saving...' : 'Save'}
            </button>
            {modalSuccess && <p className="modal-success">{modalSuccess}</p>}
            {modalError && <p className="modal-error">{modalError}</p>}
          </div>
        </section>

        <section className="modal-section">
          <h4>Comments</h4>
          <div className="form-row">
            <textarea
              id="modalCommentText"
              rows={3}
              placeholder="Write a comment..."
              value={commentText}
              disabled={isSavingComment}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <button
              type="button"
              className="btn-secondary"
              disabled={isSavingComment}
              onClick={handleAddComment}
            >
              {isSavingComment ? 'Adding...' : 'Add Comment'}
            </button>
            {commentsLoading && <p className="comments-state">Loading comments...</p>}
            {commentsError && (
              <p className="comments-state comments-state-error">{commentsError}</p>
            )}
            {!commentsLoading && comments.length === 0 && !commentsError && (
              <p className="comments-state">No comments yet.</p>
            )}
            <ul className="comments-list">
              {comments.map((comment) => (
                <li key={comment.commentId} className="comment-item">
                  <p className="comment-content">{comment.content || ''}</p>
                  <p className="comment-meta">{formatTime(comment.createdAt, '-')}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TaskModal;

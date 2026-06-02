import { formatTime, getSortedComments, getStatusBadgeClass } from '../utils/taskUtils.js';

function TaskCard({ task, comments }) {
  const statusNorm = (task.status || 'CREATED').toUpperCase();
  const sortedComments = getSortedComments(comments);

  return (
    <li className="feed-item" data-task-id={task.id} tabIndex={0}>
      <div className="feed-item-header">
        <p className="feed-item-title">{task.title || 'Untitled task'}</p>
        <span className={`task-status-badge ${getStatusBadgeClass(statusNorm)}`}>
          {statusNorm}
        </span>
      </div>
      <p className="feed-item-meta">
        <strong>createdAt:</strong> {formatTime(task.createdAt, '-')}
      </p>
      <p className="feed-item-meta">
        <strong>dueAt:</strong> {formatTime(task.dueAt, 'No due date')}
      </p>
      <p className="feed-item-meta">
        <strong>id:</strong> {task.id || '-'}
      </p>
      {sortedComments.length > 0 && (
        <>
          <p className="feed-item-meta">
            <strong>Comments:</strong>
          </p>
          <ul className="feed-comments">
            {sortedComments.map((comment) => (
              <li key={comment.commentId}>{comment.content || ''}</li>
            ))}
          </ul>
        </>
      )}
    </li>
  );
}

export default TaskCard;

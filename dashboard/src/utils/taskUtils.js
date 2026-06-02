export function formatTime(isoTime, fallbackText) {
  if (!isoTime) {
    return fallbackText || '-';
  }
  const parsed = new Date(isoTime);
  if (Number.isNaN(parsed.getTime())) {
    return isoTime;
  }
  return parsed.toLocaleString();
}

export function getStatusBadgeClass(status) {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'CREATED') return 'task-status-created';
  if (normalized === 'IN_PROGRESS') return 'task-status-in-progress';
  if (normalized === 'COMPLETED') return 'task-status-completed';
  if (normalized === 'OVERDUE') return 'task-status-overdue';
  return 'task-status-unknown';
}

export function normalizeTaskPayload(raw) {
  const id = raw.id != null ? String(raw.id) : raw.taskId != null ? String(raw.taskId) : '';
  return {
    id,
    title: raw.title != null ? String(raw.title) : '',
    createdAt: raw.createdAt != null ? String(raw.createdAt) : '',
    dueAt: raw.dueAt != null && String(raw.dueAt).trim() !== '' ? String(raw.dueAt) : null,
    status: raw.status != null ? String(raw.status) : 'CREATED',
  };
}

export function normalizeCommentPayload(raw, fallbackTaskId) {
  const taskId =
    raw.taskId != null
      ? String(raw.taskId)
      : fallbackTaskId != null
        ? String(fallbackTaskId)
        : '';
  const commentId = raw.commentId != null ? String(raw.commentId) : raw.id != null ? String(raw.id) : '';
  return {
    taskId,
    commentId,
    content: raw.content != null ? String(raw.content) : '',
    createdAt: raw.createdAt != null ? String(raw.createdAt) : '',
  };
}

export function getSortedComments(comments) {
  return (comments || []).slice().sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime();
    const tb = new Date(b.createdAt || 0).getTime();
    return ta - tb;
  });
}

export function mergeComments(existing, incoming) {
  const mergedMap = new Map();
  for (const item of existing || []) {
    if (item.commentId) {
      mergedMap.set(item.commentId, item);
    }
  }
  for (const item of incoming || []) {
    if (item && item.commentId) {
      mergedMap.set(item.commentId, item);
    }
  }
  return Array.from(mergedMap.values());
}

export function computeStats(tasksById) {
  let created = 0;
  let inProgress = 0;
  let completed = 0;
  let overdue = 0;

  for (const task of Object.values(tasksById)) {
    const s = (task.status || '').toUpperCase();
    if (s === 'CREATED') created += 1;
    else if (s === 'IN_PROGRESS') inProgress += 1;
    else if (s === 'COMPLETED') completed += 1;
    else if (s === 'OVERDUE') overdue += 1;
  }

  return {
    total: Object.keys(tasksById).length,
    created,
    inProgress,
    completed,
    overdue,
  };
}

export function groupTasksByStatus(tasksById) {
  const grouped = {
    CREATED: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    OVERDUE: [],
  };

  for (const task of Object.values(tasksById)) {
    const status = (task.status || 'CREATED').toUpperCase();
    if (grouped[status]) {
      grouped[status].push(task);
    } else {
      grouped.CREATED.push(task);
    }
  }

  for (const statusKey of Object.keys(grouped)) {
    grouped[statusKey].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });
  }

  return grouped;
}

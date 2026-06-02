import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchCommentsForTask,
  fetchTasks,
  patchTaskStatus,
  postTaskComment,
  resolveTasksUrl,
  resolveWsUrl,
  TASKS_TOPIC,
} from './api/tasksApi.js';
import DashboardStats from './components/DashboardStats.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import TaskModal from './components/TaskModal.jsx';
import {
  computeStats,
  getSortedComments,
  mergeComments,
  normalizeCommentPayload,
  normalizeTaskPayload,
} from './utils/taskUtils.js';
import { createTaskSocket } from './websocket/taskSocket.js';

function App() {
  const [tasksById, setTasksById] = useState({});
  const [commentsByTaskId, setCommentsByTaskId] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [connectionState, setConnectionState] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [restLoadState, setRestLoadState] = useState('loading');
  const [restError, setRestError] = useState(null);

  const selectedTask = selectedTaskId ? tasksById[selectedTaskId] ?? null : null;
  const tasksUrl = useMemo(() => resolveTasksUrl(), []);

  const stats = useMemo(() => computeStats(tasksById), [tasksById]);

  const mergeCommentsForTask = useCallback((taskId, incomingComments) => {
    setCommentsByTaskId((prev) => ({
      ...prev,
      [taskId]: mergeComments(prev[taskId], incomingComments),
    }));
  }, []);

  const upsertTask = useCallback((rawPayload) => {
    const normalized = normalizeTaskPayload(rawPayload);
    if (!normalized.id) {
      console.warn('Task payload missing id/taskId:', rawPayload);
      return;
    }
    setTasksById((prev) => ({ ...prev, [normalized.id]: normalized }));
    setLastUpdateTime(Date.now());
  }, []);

  const handleTaskCommentAdded = useCallback(
    (rawPayload) => {
      const normalized = normalizeCommentPayload(rawPayload);
      if (!normalized.taskId || !normalized.commentId) {
        console.warn('Invalid comment payload:', rawPayload);
        return;
      }
      mergeCommentsForTask(normalized.taskId, [normalized]);
    },
    [mergeCommentsForTask],
  );

  const handleSocketEnvelope = useCallback(
    (rawMessage) => {
      const envelope = JSON.parse(rawMessage);
      const type = envelope && envelope.type;
      const payload = envelope && envelope.payload;
      if (!type || !payload) {
        throw new Error('Invalid event envelope.');
      }

      if (type === 'TASK_CREATED' || type === 'TASK_STATUS_CHANGED') {
        upsertTask(payload);
        return;
      }

      if (type === 'TASK_COMMENT_ADDED') {
        handleTaskCommentAdded(payload);
        return;
      }

      console.warn('Unhandled event type:', type);
    },
    [upsertTask, handleTaskCommentAdded],
  );

  const loadCommentsSnapshotForTasks = useCallback(
    async (taskIds) => {
      if (!taskIds.length) return;
      const results = await Promise.allSettled(taskIds.map((taskId) => fetchCommentsForTask(taskId)));
      for (let i = 0; i < results.length; i += 1) {
        const result = results[i];
        const taskId = taskIds[i];
        if (result.status === 'fulfilled') {
          mergeCommentsForTask(taskId, result.value);
        } else {
          console.error('Failed loading comments for task:', taskId, result.reason);
        }
      }
    },
    [mergeCommentsForTask],
  );

  const loadTasksFromRest = useCallback(
    async (options = {}) => {
      const replaceAll = options.replaceAll === true;

      if (replaceAll) {
        setTasksById({});
        setCommentsByTaskId({});
        setLastUpdateTime(null);
      }

      setRestLoadState('loading');
      setRestError(null);

      try {
        const tasks = await fetchTasks();
        const taskIds = tasks.map((t) => t.id);

        setTasksById((prev) => {
          const next = replaceAll ? {} : { ...prev };
          for (const task of tasks) {
            next[task.id] = task;
          }
          return next;
        });

        if (replaceAll) {
          setCommentsByTaskId({});
        }

        await loadCommentsSnapshotForTasks(taskIds);
        setLastUpdateTime(Date.now());
        setRestLoadState('ok');
      } catch (err) {
        console.error('loadTasksFromRest:', err);
        setRestLoadState('error');
        setRestError(err);
      }
    },
    [loadCommentsSnapshotForTasks],
  );

  const handleRetryLoad = useCallback(() => {
    loadTasksFromRest({ replaceAll: true });
  }, [loadTasksFromRest]);

  const handleTaskSelect = useCallback((taskId) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  const handleLoadComments = useCallback(
    async (taskId) => {
      const normalized = await fetchCommentsForTask(taskId);
      mergeCommentsForTask(taskId, normalized);
    },
    [mergeCommentsForTask],
  );

  const handleSaveStatus = useCallback(async (taskId, status) => {
    await patchTaskStatus(taskId, status);
  }, []);

  const handleAddComment = useCallback(async (taskId, content) => {
    await postTaskComment(taskId, content);
  }, []);

  useEffect(() => {
    let socket;
    let cancelled = false;

    (async () => {
      await loadTasksFromRest({ replaceAll: false });
      if (cancelled) return;

      socket = createTaskSocket({
        brokerURL: resolveWsUrl(),
        topic: TASKS_TOPIC,
        onConnect: () => setConnectionState(true),
        onDisconnect: () => setConnectionState(false),
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers?.message, frame.body);
        },
        onMessage: (body) => {
          try {
            handleSocketEnvelope(body);
          } catch (error) {
            console.error('Invalid task event payload:', error);
          }
        },
      });
      socket.activate();
    })();

    return () => {
      cancelled = true;
      socket?.deactivate();
    };
  }, [handleSocketEnvelope, loadTasksFromRest]);

  const showEmptyState = Object.keys(tasksById).length === 0 && restLoadState === 'ok';

  const restStatusHint =
    window.location.protocol === 'file:'
      ? ' פתיחה מ־file:// גורמת לרוב לחסימת CORS — הגש את הדף מ־http://localhost:8080 (או הוסף CORS ל־GET /tasks).'
      : '';

  const selectedComments = selectedTaskId
    ? getSortedComments(commentsByTaskId[selectedTaskId])
    : [];

  return (
    <div className="container">
      <header className="header">
        <h1>TaskPulse</h1>
        <span
          className={`status-badge ${connectionState ? 'status-connected' : 'status-disconnected'}`}
        >
          {connectionState ? 'Connected' : 'Disconnected'}
        </span>
      </header>

      <DashboardStats
        stats={stats}
        lastUpdateTime={lastUpdateTime}
        connectionState={connectionState}
      />

      <section className="card tasks-section">
        <h2 className="feed-title">Tasks</h2>

        {restLoadState === 'loading' && (
          <p className="rest-status rest-loading">טוען משימות מ־GET {tasksUrl} …</p>
        )}

        {restLoadState === 'error' && restError && (
          <>
            <p className="rest-status rest-error">
              לא ניתן לטעון את רשימת המשימות.{' '}
              {restError.message ? restError.message : String(restError)}.{restStatusHint}
            </p>
            <button type="button" className="btn-retry" onClick={handleRetryLoad}>
              נסה שוב לטעון מ-GET /tasks
            </button>
          </>
        )}

        {showEmptyState && (
          <p className="empty-state">אין משימות (אחרי טעינה מוצלחת מהשרת).</p>
        )}

        <KanbanBoard
          tasksById={tasksById}
          commentsByTaskId={commentsByTaskId}
          onTaskSelect={handleTaskSelect}
        />
      </section>

      <TaskModal
        task={selectedTask}
        isOpen={Boolean(selectedTaskId && selectedTask)}
        comments={selectedComments}
        onClose={handleCloseModal}
        onLoadComments={handleLoadComments}
        onSaveStatus={handleSaveStatus}
        onAddComment={handleAddComment}
      />
    </div>
  );
}

export default App;

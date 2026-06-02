import { normalizeCommentPayload, normalizeTaskPayload } from '../utils/taskUtils.js';

export const BACKEND_ORIGIN = 'http://localhost:8080';
export const TASKS_TOPIC = '/topic/tasks';

export function shouldUseBackendFallbackHost() {
  const host = window.location.hostname;
  const port = window.location.port;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  const isKnownFrontendPort =
    port === '5500' || port === '3000' || port === '5173' || port === '4173';
  return isLocalHost && isKnownFrontendPort;
}

export function resolveTasksUrl() {
  const proto = window.location.protocol;
  if ((proto === 'http:' || proto === 'https:') && !shouldUseBackendFallbackHost()) {
    return new URL('/tasks', window.location.origin).href;
  }
  return new URL('/tasks', BACKEND_ORIGIN).href;
}

export function resolveWsUrl() {
  const proto = window.location.protocol;
  if (proto === 'http:' && !shouldUseBackendFallbackHost()) {
    return `ws://${window.location.host}/ws`;
  }
  if (proto === 'https:' && !shouldUseBackendFallbackHost()) {
    return `wss://${window.location.host}/ws`;
  }
  const backendWsOrigin = BACKEND_ORIGIN.replace(/^http/i, 'ws');
  return new URL('/ws', backendWsOrigin).href;
}

export function buildTaskStatusPatchUrl(taskId) {
  const base = new URL(resolveTasksUrl(), window.location.href);
  return new URL(`/tasks/${encodeURIComponent(taskId)}/status`, base.origin).href;
}

export function buildTaskCommentsUrl(taskId) {
  const base = new URL(resolveTasksUrl(), window.location.href);
  return new URL(`/tasks/${encodeURIComponent(taskId)}/comments`, base.origin).href;
}

export async function fetchTasks() {
  const response = await fetch(resolveTasksUrl(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`השרת החזיר ${response.status} עבור GET /tasks`);
  }
  const list = await response.json();
  if (!Array.isArray(list)) {
    throw new Error('צפוי מערך JSON מהשרת');
  }
  return list
    .map((item) => normalizeTaskPayload(item))
    .filter((item) => item.id);
}

export async function fetchCommentsForTask(taskId) {
  const response = await fetch(buildTaskCommentsUrl(taskId), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load comments: ${response.status}`);
  }
  const list = await response.json();
  if (!Array.isArray(list)) {
    throw new Error('Comments response must be an array.');
  }
  return list
    .map((item) => normalizeCommentPayload(item, taskId))
    .filter((item) => item.taskId && item.commentId);
}

export async function patchTaskStatus(taskId, status) {
  const response = await fetch(buildTaskStatusPatchUrl(taskId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`Status update failed with ${response.status}`);
  }
}

export async function postTaskComment(taskId, content) {
  const response = await fetch(buildTaskCommentsUrl(taskId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add comment: ${response.status}`);
  }
}

import { useMemo } from 'react';
import { groupTasksByStatus } from '../utils/taskUtils.js';
import KanbanColumn from './KanbanColumn.jsx';

const COLUMNS = [
  { status: 'CREATED', title: 'Created' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'COMPLETED', title: 'Completed' },
  { status: 'OVERDUE', title: 'Overdue' },
];

function KanbanBoard({ tasksById, commentsByTaskId, onTaskSelect }) {
  const grouped = useMemo(() => groupTasksByStatus(tasksById), [tasksById]);

  return (
    <div
      className="kanban-board"
      aria-live="polite"
      onClick={(event) => {
        const taskCard = event.target.closest('.feed-item');
        if (!taskCard) return;
        const taskId = taskCard.dataset.taskId;
        if (taskId) {
          onTaskSelect(taskId);
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const taskCard = event.target.closest('.feed-item');
        if (!taskCard) return;
        event.preventDefault();
        const taskId = taskCard.dataset.taskId;
        if (taskId) {
          onTaskSelect(taskId);
        }
      }}
    >
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          tasks={grouped[column.status]}
          commentsByTaskId={commentsByTaskId}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;

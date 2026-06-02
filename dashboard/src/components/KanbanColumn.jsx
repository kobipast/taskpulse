import TaskCard from './TaskCard.jsx';

function KanbanColumn({ title, tasks = [], commentsByTaskId }) {
  const isEmpty = tasks.length === 0;

  return (
    <section className="kanban-column">
      <h3 className="kanban-column-header">{title}</h3>
      {isEmpty && <p className="kanban-empty">No tasks</p>}
      <ul className="feed-list kanban-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            comments={commentsByTaskId[task.id]}
          />
        ))}
      </ul>
    </section>
  );
}

export default KanbanColumn;

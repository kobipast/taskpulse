function DashboardStats({ stats, lastUpdateTime, connectionState }) {
  const connectionLabel = connectionState ? 'Connected' : 'Disconnected';
  const lastUpdateLabel =
    lastUpdateTime != null ? new Date(lastUpdateTime).toLocaleString() : '-';

  return (
    <section className="stats-grid">
      <article className="card">
        <div className="card-label">Total tasks</div>
        <div className="card-value">{String(stats.total)}</div>
      </article>
      <article className="card">
        <div className="card-label">CREATED</div>
        <div className="card-value">{String(stats.created)}</div>
      </article>
      <article className="card">
        <div className="card-label">IN_PROGRESS</div>
        <div className="card-value">{String(stats.inProgress)}</div>
      </article>
      <article className="card">
        <div className="card-label">COMPLETED</div>
        <div className="card-value">{String(stats.completed)}</div>
      </article>
      <article className="card">
        <div className="card-label">OVERDUE</div>
        <div className="card-value">{String(stats.overdue)}</div>
      </article>
      <article className="card">
        <div className="card-label">Last update time</div>
        <div className="card-value">{lastUpdateLabel}</div>
      </article>
      <article className="card">
        <div className="card-label">Connection state</div>
        <div className="card-value">{connectionLabel}</div>
      </article>
    </section>
  );
}

export default DashboardStats;

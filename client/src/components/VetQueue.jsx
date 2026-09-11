export default function VetQueue({ clusters, isolated, selectedKey, onSelect }) {
  // Stage is read from data already present — nothing is recomputed.
  const top = clusters[0];
  const stage =
    clusters.length === 0
      ? 0
      : top.priorityLabel === "HIGH" || top.priorityLabel === "CRITICAL"
      ? 2
      : 1;

  const STAGES = ["No cluster", "Cluster detected", "Priority raised"];

  return (
    <div className="card">
      <h2 className="amber">Veterinary priority queue</h2>

      <div className="stages">
        {STAGES.map((s, i) => (
          <div
            key={s}
            className={`stage ${i < stage ? "past" : ""} ${i === stage ? "now" : ""}`}
          >
            <span className="dot" />
            {s}
          </div>
        ))}
      </div>
      {clusters.length === 0 && (
        <div className="empty">
          No clusters yet. Isolated reports are monitored, not escalated.
        </div>
      )}
      {clusters.map((cl) => (
        <div
          key={cl.clusterKey}
          className={`queue-item ${cl.priorityLabel} ${cl.clusterKey === selectedKey ? "selected" : ""}`}
          onClick={() => onSelect(cl.clusterKey)}
        >
          <div className="head">
            <span className="title">{cl.clusterId}</span>
            <span className={`pill ${cl.priorityLabel}`}>{cl.priorityLabel}</span>
            <span className="score">{cl.priorityScore}</span>
          </div>
          <div className="meta">
            {cl.signal.caseCount} cases · {cl.signal.villageCount} villages ·{" "}
            {cl.signal.windowHours} h · {cl.geometry.radiusKm} km
          </div>
          <div className="meta">{cl.syndrome}</div>
          <div className="meta">
            Verification: <strong>{cl.action.verificationStatus.replace(/_/g, " ")}</strong>
          </div>
        </div>
      ))}

      {isolated.length > 0 && (
        <>
          <h2 style={{ background: "#5b6b60" }}>Isolated reports — monitor</h2>
          {isolated.map((c) => (
            <div key={c.id} className="queue-item LOW" style={{ borderLeftColor: "#9aa79e", cursor: "default" }}>
              <div className="head">
                <span className="title">{c.id}</span>
                <span className="meta" style={{ marginLeft: "auto" }}>{c.village}</span>
              </div>
              <div className="meta">{c.syndrome}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

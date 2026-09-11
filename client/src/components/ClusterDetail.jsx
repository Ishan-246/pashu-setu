import { updateAction } from "../api";

const LABELS = {
  PENDING: "Pending",
  UNDER_VERIFICATION: "Under verification",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  NOT_REQUIRED: "Not required",
  SAMPLE_COLLECTED: "Sample collected",
  IN_TESTING: "In testing",
  RESULT_READY: "Result ready",
  CONFIRMED: "Confirmed",
  RULED_OUT: "Ruled out",
  INCONCLUSIVE: "Inconclusive",
  NONE: "None",
  RESPONSE_INITIATED: "Response initiated",
  VACCINATION_LOGGED: "Vaccination logged",
  CONTAINMENT_LOGGED: "Containment logged",
  CLOSED: "Closed",
};

function Options({ values, current, onPick }) {
  return (
    <div className="opts">
      {values.map((v) => (
        <button
          key={v}
          className={`ghost ${current === v ? "on" : ""}`}
          onClick={() => onPick(v)}
        >
          {LABELS[v] ?? v}
        </button>
      ))}
    </div>
  );
}

export default function ClusterDetail({ cluster, workflow, onChanged }) {
  if (!cluster) {
    return (
      <div className="card">
        <h2>Cluster detail</h2>
        <div className="empty">Select a cluster from the queue.</div>
      </div>
    );
  }

  const a = cluster.action;
  const b = cluster.breakdown;

  async function patch(body) {
    await updateAction(cluster.clusterKey, body);
    onChanged();
  }

  const contrib = {
    strength: Math.round(b.clusterStrength * b.weights.clusterStrength),
    severity: Math.round(b.severity * b.weights.severity),
    risk: Math.round(b.riskContext * b.weights.riskContext),
  };

  return (
    <div className="card">
      <h2 className="navy">
        {cluster.clusterId} — risk fusion &amp; veterinary action
      </h2>
      <div className="body">
        <div className="status-strip">{cluster.status}</div>

        <div className="evidence">
          <strong>{cluster.signal.caseCount} similar reports</strong> across{" "}
          <strong>
            {cluster.signal.villageCount}{" "}
            {cluster.signal.villageCount === 1 ? "village" : "villages"}
          </strong>
          , within <strong>{cluster.signal.windowHours} hours</strong>, inside a{" "}
          <strong>{cluster.geometry.radiusKm} km</strong> radius — in an area
          with <strong>{cluster.risk.level}</strong> recorded risk context.
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="n">{cluster.signal.caseCount}</div>
            <div className="l">Cases</div>
          </div>
          <div className="stat">
            <div className="n">{cluster.signal.villageCount}</div>
            <div className="l">Villages</div>
          </div>
          <div className="stat">
            <div className="n">{cluster.signal.windowHours} h</div>
            <div className="l">Window</div>
          </div>
          <div className="stat">
            <div className="n">{cluster.geometry.radiusKm} km</div>
            <div className="l">Radius</div>
          </div>
        </div>

        <table className="breakdown">
          <tbody>
            <tr>
              <td>
                Cluster strength
                <div className="bar">
                  <span style={{ width: `${b.clusterStrength}%` }} />
                </div>
              </td>
              <td>
                {b.clusterStrength} × {b.weights.clusterStrength} = {contrib.strength}
              </td>
            </tr>
            <tr>
              <td>
                Mean severity
                <div className="bar">
                  <span style={{ width: `${b.severity}%`, background: "#b45309" }} />
                </div>
              </td>
              <td>
                {b.severity} × {b.weights.severity} = {contrib.severity}
              </td>
            </tr>
            <tr>
              <td>
                Risk context — {cluster.risk.level}
                {cluster.risk.village ? ` (${cluster.risk.village})` : ""}{" "}
                <span className="sim-tag">SIMULATED</span>
                <div className="bar">
                  <span style={{ width: `${b.riskContext}%`, background: "#1f4e9c" }} />
                </div>
              </td>
              <td>
                {b.riskContext} × {b.weights.riskContext} = {contrib.risk}
              </td>
            </tr>
            <tr className="total">
              <td>Priority</td>
              <td>
                {cluster.priorityScore}{" "}
                <span className={`pill ${cluster.priorityLabel}`}>
                  {cluster.priorityLabel}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="note">
          {cluster.risk.source
            ? `Risk context source: ${cluster.risk.source}.`
            : "No risk context available for these villages."}{" "}
          Prototype weights, to be calibrated using verified surveillance data.
        </p>

        <div className="workflow" style={{ marginTop: 18 }}>
          <div className={`step ${a.verificationStatus !== "PENDING" ? "done" : ""}`}>
            <div className="n">1 · Veterinary verification</div>
            <Options
              values={workflow.verification}
              current={a.verificationStatus}
              onPick={(v) => patch({ verificationStatus: v })}
            />
          </div>

          <div className={`step ${a.labStatus !== "NOT_REQUIRED" ? "done" : ""}`}>
            <div className="n">2 · Laboratory</div>
            <Options
              values={workflow.lab}
              current={a.labStatus}
              onPick={(v) => patch({ labStatus: v, labRequired: v !== "NOT_REQUIRED" })}
            />
            {a.labStatus === "RESULT_READY" && (
              <div style={{ marginTop: 10 }}>
                <div className="n">Result</div>
                <Options
                  values={workflow.labResult}
                  current={a.labResult}
                  onPick={(v) => patch({ labResult: v })}
                />
              </div>
            )}
          </div>

          <div className={`step ${a.responseStatus !== "NONE" ? "done" : ""}`}>
            <div className="n">3 · Response status</div>
            <Options
              values={workflow.response}
              current={a.responseStatus}
              onPick={(v) => patch({ responseStatus: v })}
            />
          </div>
        </div>

        <h3 style={{ fontSize: 13, textTransform: "uppercase", color: "#5b6b60", marginTop: 22 }}>
          Cases in this cluster
        </h3>
        <table className="cases">
          <thead>
            <tr>
              <th>ID</th>
              <th>Village</th>
              <th>Species</th>
              <th>Severity</th>
              <th>Reported</th>
            </tr>
          </thead>
          <tbody>
            {cluster.cases.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.village}</td>
                <td>{c.species}</td>
                <td>
                  <span className={`pill ${c.severityLevel}`}>{c.severityLevel}</span>
                </td>
                <td>{new Date(c.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

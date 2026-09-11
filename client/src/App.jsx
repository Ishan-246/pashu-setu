import { useEffect, useState, useCallback } from "react";
import { getMeta, getClusters, seedDemo, resetDemo } from "./api";
import ReportForm from "./components/ReportForm";
import VetQueue from "./components/VetQueue";
import ClusterDetail from "./components/ClusterDetail";
import ClusterMap from "./components/ClusterMap";

export default function App() {
  const [meta, setMeta] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("report");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const d = await getClusters();
      setData(d);
      setError(null);
      // Keep selection if it still exists, else select the top cluster.
      setSelected((prev) => {
        if (prev && d.clusters.some((c) => c.clusterKey === prev)) return prev;
        return d.clusters[0]?.clusterKey ?? null;
      });
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    getMeta().then(setMeta).catch((e) => setError(e.message));
    refresh();
  }, [refresh]);

  if (error && !data) {
    return (
      <div className="page">
        <div className="toast error">
          Cannot reach the backend. Start it with <code>npm start</code> in the
          server folder, then reload. ({error})
        </div>
      </div>
    );
  }
  if (!meta || !data) return <div className="page">Loading…</div>;

  const cluster = data.clusters.find((c) => c.clusterKey === selected) ?? null;

  return (
    <>
      <div className="topbar">
        <h1>PASHU-SETU</h1>
        <span className="tag">
          from disease-risk intelligence to prioritised veterinary response
        </span>
        <span className="spacer" />
        <div className="tabs">
          <button
            className={tab === "report" ? "active" : ""}
            onClick={() => setTab("report")}
          >
            Report intake
          </button>
          <button
            className={tab === "dash" ? "active" : ""}
            onClick={() => setTab("dash")}
          >
            Veterinary dashboard
          </button>
        </div>
      </div>

      <div className="banner">
        <strong>SIMULATED / DEMO DATA</strong> — risk context is a NADRES-style
        mock layer, not live government data. No connection to any government
        system. Clustering parameters: {data.params.epsSpatialKm} km ·{" "}
        {data.params.epsTemporalHours} h · minimum {data.params.minPts} cases —
        prototype values, not validated epidemiological thresholds.
      </div>

      <div className="page">
        {tab === "report" ? (
          <div className="grid two">
            <ReportForm meta={meta} onSubmitted={refresh} />
            <div className="card">
              <h2>Live signal — {data.totalCases} reports stored</h2>
              <div className="body">
                <ClusterMap
                  clusters={data.clusters}
                  isolated={data.isolatedCases}
                  selectedKey={selected}
                />
                <div className="stat-row" style={{ marginTop: 16 }}>
                  <div className="stat">
                    <div className="n">{data.totalCases}</div>
                    <div className="l">Reports</div>
                  </div>
                  <div className="stat">
                    <div className="n">{data.clusters.length}</div>
                    <div className="l">Clusters</div>
                  </div>
                  <div className="stat">
                    <div className="n">{data.isolatedCases.length}</div>
                    <div className="l">Isolated</div>
                  </div>
                  <div className="stat">
                    <div className="n">
                      {data.clusters[0]?.priorityLabel ?? "—"}
                    </div>
                    <div className="l">Top priority</div>
                  </div>
                </div>
                <div className="presets" style={{ marginTop: 8 }}>
                  <button className="ghost" onClick={() => seedDemo(1).then(refresh)}>
                    1 report — no cluster
                  </button>
                  <button className="ghost" onClick={() => seedDemo(3).then(refresh)}>
                    3 reports — cluster forms
                  </button>
                  <button className="ghost" onClick={() => seedDemo(7).then(refresh)}>
                    7 reports — full scenario
                  </button>
                  <button className="ghost" onClick={() => resetDemo().then(refresh)}>
                    Clear
                  </button>
                </div>
                <p className="note">{data.riskDisclaimer}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid detail">
            <div>
              <div className="card" style={{ marginBottom: 18 }}>
                <h2>Cluster map</h2>
                <div className="body">
                  <ClusterMap
                    clusters={data.clusters}
                    isolated={data.isolatedCases}
                    selectedKey={selected}
                  />
                </div>
              </div>
              <ClusterDetail
                cluster={cluster}
                workflow={meta.workflow}
                onChanged={refresh}
              />
            </div>
            <VetQueue
              clusters={data.clusters}
              isolated={data.isolatedCases}
              selectedKey={selected}
              onSelect={setSelected}
            />
          </div>
        )}
      </div>
    </>
  );
}

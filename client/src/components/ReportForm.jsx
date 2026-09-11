import { useState } from "react";
import { submitCase } from "../api";

// Simulates a transcribed helpline call. The farmer never sees this screen —
// in production the IVR/WhatsApp gateway POSTs the same payload.

export default function ReportForm({ meta, onSubmitted }) {
  const villages = Object.keys(meta.villages);

  const [village, setVillage] = useState(villages[0]);
  const [species, setSpecies] = useState("Cattle");
  const [animals, setAnimals] = useState(1);
  const [symptoms, setSymptoms] = useState([]);
  const [reportText, setReportText] = useState("");
  const [useNow, setUseNow] = useState(true);
  const [when, setWhen] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  function applyPreset(p) {
    setSymptoms(p.symptoms);
    setReportText(p.reportText);
    setSpecies(p.species);
    setAnimals(p.animalsAffected);
    setMsg(null);
  }

  function toggle(value) {
    setSymptoms((s) =>
      s.includes(value) ? s.filter((x) => x !== value) : [...s, value]
    );
  }

  async function handleSubmit() {
    setBusy(true);
    setMsg(null);
    try {
      const created = await submitCase({
        village,
        species,
        animalsAffected: Number(animals),
        symptoms,
        reportText: reportText || null,
        timestamp: useNow || !when ? new Date().toISOString() : new Date(when).toISOString(),
      });
      setMsg({
        ok: true,
        text: `${created.id} recorded — ${created.syndrome}, severity ${created.severityLevel}`,
      });
      setSymptoms([]);
      setReportText("");
      onSubmitted();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 className="green">Incoming report — helpline intake</h2>
      <div className="body">
        {msg && (
          <div className={`toast ${msg.ok ? "" : "error"}`}>{msg.text}</div>
        )}

        <label>Load a sample call</label>
        <div className="presets">
          {meta.presetReports.map((p) => (
            <button key={p.key} className="ghost" onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="field">
          <label>Transcribed message</label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="What the farmer said on the call…"
          />
        </div>

        <div className="row field">
          <div>
            <label>Village</label>
            <select value={village} onChange={(e) => setVillage(e.target.value)}>
              {villages.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Species</label>
            <select value={species} onChange={(e) => setSpecies(e.target.value)}>
              <option>Cattle</option>
              <option>Buffalo</option>
              <option>Goat</option>
              <option>Sheep</option>
            </select>
          </div>
        </div>

        <div className="row field">
          <div>
            <label>Animals affected</label>
            <input
              type="number"
              min="1"
              value={animals}
              onChange={(e) => setAnimals(e.target.value)}
            />
          </div>
          <div>
            <label>Time of report</label>
            {useNow ? (
              <button className="ghost on" onClick={() => setUseNow(false)} style={{ width: "100%", padding: "8px" }}>
                Now
              </button>
            ) : (
              <input
                type="text"
                value={when}
                placeholder="2026-09-09T15:00"
                onChange={(e) => setWhen(e.target.value)}
                onBlur={() => !when && setUseNow(true)}
              />
            )}
          </div>
        </div>

        <div className="field">
          <label>Reported signs ({symptoms.length} selected)</label>
          <div className="symptoms">
            {meta.symptomOptions.map((o) => (
              <label key={o.value}>
                <input
                  type="checkbox"
                  checked={symptoms.includes(o.value)}
                  onChange={() => toggle(o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <button
          className="primary"
          disabled={busy || symptoms.length === 0}
          onClick={handleSubmit}
        >
          {busy ? "Submitting…" : "Submit report"}
        </button>

        <p className="note">
          The farmer does not use this screen. In production the helpline
          (IVR / WhatsApp / SMS) sends this same payload to the backend. The
          system records a syndrome and a severity — never a diagnosis.
        </p>
      </div>
    </div>
  );
}

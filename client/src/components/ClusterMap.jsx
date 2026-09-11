import { Fragment } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip } from "react-leaflet";

const COLOURS = { LOW: "#2e7d32", MEDIUM: "#b45309", HIGH: "#9f1239", CRITICAL: "#9f1239" };

export default function ClusterMap({ clusters, isolated, selectedKey }) {
  const all = clusters.flatMap((c) => c.cases);
  const centre = all.length
    ? [
        all.reduce((s, c) => s + c.lat, 0) / all.length,
        all.reduce((s, c) => s + c.lng, 0) / all.length,
      ]
    : [21.3486, 74.8811];

  return (
    <div className="map">
      <div className="map-sim-label">SIMULATED / DEMO DATA</div>
      <MapContainer center={centre} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cl) => {
          const colour = COLOURS[cl.priorityLabel] ?? "#5b6b60";
          const active = cl.clusterKey === selectedKey;
          return (
            <Fragment key={cl.clusterKey}>
              <Circle
                center={[cl.geometry.centre.lat, cl.geometry.centre.lng]}
                radius={Math.max(cl.geometry.radiusKm, 0.5) * 1000}
                pathOptions={{
                  color: colour,
                  fillColor: colour,
                  fillOpacity: active ? 0.18 : 0.08,
                  weight: active ? 3 : 1.5,
                }}
              />
              {cl.cases.map((c) => (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lng]}
                  radius={7}
                  pathOptions={{ color: colour, fillColor: colour, fillOpacity: 0.9 }}
                >
                  <Tooltip>
                    <strong>{c.id}</strong> — {c.village}
                    <br />
                    {c.syndrome}
                    <br />
                    severity {c.severityLevel}
                  </Tooltip>
                </CircleMarker>
              ))}
            </Fragment>
          );
        })}

        {isolated.map((c) => (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={5}
            pathOptions={{ color: "#9aa79e", fillColor: "#fff", fillOpacity: 1, weight: 2 }}
          >
            <Tooltip>
              <strong>{c.id}</strong> — {c.village}
              <br />
              isolated report
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

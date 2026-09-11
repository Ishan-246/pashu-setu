const BASE = "/api";

async function req(path, options) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const getMeta = () => req("/meta");
export const getCases = () => req("/cases");
export const getClusters = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return req(`/clusters${q ? `?${q}` : ""}`);
};
export const submitCase = (report) =>
  req("/cases", { method: "POST", body: JSON.stringify(report) });
export const updateAction = (clusterKey, patch) =>
  req(`/clusters/${encodeURIComponent(clusterKey)}/action`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
export const seedDemo = (count) =>
  req("/demo/seed", { method: "POST", body: JSON.stringify({ count }) });
export const resetDemo = () => req("/demo/reset", { method: "POST" });

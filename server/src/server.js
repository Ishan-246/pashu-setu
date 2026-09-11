import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import api from "./routes/api.js";
import { driverName } from "./storage/index.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", api);

app.get("/health", (req, res) =>
  res.json({ service: "Pashu-Setu", status: "ok", storage: driverName })
);

// In deployment, serve the built React app from this same server so the whole
// prototype lives on ONE url. In local dev this folder does not exist and Vite
// serves the frontend on :5173 instead — nothing changes for `npm run dev`.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "..", "..", "client", "dist");

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get("*", (req, res) => res.sendFile(path.join(CLIENT_DIST, "index.html")));
} else {
  app.get("/", (req, res) =>
    res.json({ service: "Pashu-Setu", status: "ok", storage: driverName })
  );
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Pashu-Setu API on http://localhost:${PORT}`);
  console.log(`Storage driver: ${driverName}  (Node ${process.version})`);
});

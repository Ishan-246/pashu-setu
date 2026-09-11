// Storage driver selector.
//
// SQLite is the intended database. Node 22.5+ ships it built in (node:sqlite),
// so we use it when available — no compilation, no build tools.
// On older Node, we fall back to a JSON file automatically.
//
// Force either one with an env var:
//   STORE=sqlite npm start
//   STORE=json   npm start

import * as jsonDriver from "./jsonDriver.js";

const requested = (process.env.STORE ?? "auto").toLowerCase();

async function pick() {
  if (requested === "json") return jsonDriver;

  try {
    const driver = await import("./sqliteDriver.js");
    return driver;
  } catch (err) {
    if (requested === "sqlite") {
      console.error(
        "\nSTORE=sqlite was requested but node:sqlite is unavailable.\n" +
          "Node 22.5 or newer is required for the built-in SQLite module.\n" +
          `Your Node: ${process.version}\n` +
          `Reason: ${err.message}\n`
      );
      process.exit(1);
    }
    console.warn(
      `[storage] node:sqlite unavailable on ${process.version} — using JSON file driver.`
    );
    return jsonDriver;
  }
}

export const driver = await pick();
export const driverName = driver.name;

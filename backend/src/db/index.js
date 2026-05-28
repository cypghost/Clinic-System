const path = require("path");
const fs   = require("fs");

const DB_DIR  = path.join(__dirname, "../../data");
const DB_PATH = path.join(DB_DIR, "clinic.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

let SQL = null;
let sqliteDb = null;

/** Persist DB buffer to disk */
function persist() {
  if (!sqliteDb) return;
  fs.writeFileSync(DB_PATH, Buffer.from(sqliteDb.export()));
}

/** Run migrations */
function migrate() {
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'patient',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id   INTEGER NOT NULL,
      doctor_name  TEXT    NOT NULL,
      department   TEXT    NOT NULL,
      date         TEXT    NOT NULL,
      time         TEXT    NOT NULL,
      reason       TEXT    NOT NULL,
      notes        TEXT,
      status       TEXT    NOT NULL DEFAULT 'pending',
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  persist();
}

/** Convert sql.js result [{columns, values}] to array of row objects */
function rowsToObjects(results) {
  if (!results || results.length === 0) return [];
  const { columns, values } = results[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

/**
 * A synchronous-style wrapper around sql.js that mimics
 * the better-sqlite3 API used in the routes.
 */
const db = {
  /** Returns all matching rows as objects */
  prepare(sql) {
    return {
      all(...params) {
        // Flatten single array arg
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = sqliteDb.prepare(sql);
        const results = [];
        stmt.bind(p.map((v) => (v === undefined ? null : v)));
        const cols = stmt.getColumnNames();
        while (stmt.step()) {
          const row = stmt.getAsObject();
          results.push(row);
        }
        stmt.free();
        return results;
      },

      get(...params) {
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = sqliteDb.prepare(sql);
        stmt.bind(p.map((v) => (v === undefined ? null : v)));
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return row;
      },

      run(...params) {
        let p;
        // Support named params as last object arg (for seed.js @name style)
        if (params.length === 1 && typeof params[0] === "object" && !Array.isArray(params[0])) {
          p = params[0];
        } else {
          p = params.map((v) => (v === undefined ? null : v));
        }
        sqliteDb.run(sql, p);
        const meta = sqliteDb.exec("SELECT last_insert_rowid() as id, changes() as changes");
        const row  = rowsToObjects(meta)[0];
        persist();
        return { lastInsertRowid: row.id, changes: row.changes };
      },
    };
  },

  exec(sql) {
    sqliteDb.run(sql);
    persist();
  },
};

/** Async init — call once before starting the server */
async function initDb() {
  const initSqlJs = require("sql.js");
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    sqliteDb = new SQL.Database(buf);
  } else {
    sqliteDb = new SQL.Database();
  }

  migrate();
  console.log("  ✓ Database ready →", DB_PATH);
  return db;
}

module.exports = { db, initDb };

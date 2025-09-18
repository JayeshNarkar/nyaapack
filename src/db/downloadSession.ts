import Database, { Database as DatabaseType } from "better-sqlite3";
import { __dirname } from "../index.js";
import path from "path";

const downloadSessionDB: DatabaseType = new Database(
  path.join(__dirname, "downloadSession.db"),
  {
    verbose: console.log,
  }
);

downloadSessionDB.exec(`
  CREATE TABLE IF NOT EXISTS downloadSession (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    torrentID TEXT,
    downloadPath TEXT,
    status TEXT DEFAULT 'downloading',
    progress REAL DEFAULT 0.0,
    startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    endTime DATETIME,
    errorMessage TEXT
  )
`);

function createDownloadSessionDB(torrentID: string, downloadPath: string) {
  const stmt = downloadSessionDB.prepare(
    "INSERT into downloadSession(torrentID, downloadPath) VALUES(?,?)"
  );
  const result = stmt.run(torrentID, downloadPath);

  return result.lastInsertRowid;
}

function updateDownloadProgress(id: number, progress: number) {
  const stmt = downloadSessionDB.prepare(
    "UPDATE downloadSession SET progress = ?, status = 'downloading' WHERE id = ?"
  );
  stmt.run(progress, id);
}

function markDownloadDone(id: number) {
  const stmt = downloadSessionDB.prepare(
    "UPDATE downloadSession SET progress = 1.0, status = 'completed', endTime = CURRENT_TIMESTAMP WHERE id = ?"
  );
  stmt.run(id);
}

function markDownloadError(id: number, errorMessage: string) {
  const stmt = downloadSessionDB.prepare(
    "UPDATE downloadSession SET status = 'error', errorMessage = ?, endTime = CURRENT_TIMESTAMP WHERE id = ?"
  );
  stmt.run(errorMessage, id);
}

function updateDownloadPath(id: number, relativePath: string) {
  const stmt = downloadSessionDB.prepare(
    "UPDATE downloadSession SET downloadPath = ? WHERE id = ?"
  );
  stmt.run(relativePath, id);
}

export {
  downloadSessionDB,
  createDownloadSessionDB,
  updateDownloadProgress,
  markDownloadDone,
  markDownloadError,
};

import Database, { Database as DatabaseType } from "better-sqlite3";
import { __dirname } from "../index.js";
import path from "path";

const downloadSessionDB: DatabaseType = new Database(
  path.join(__dirname, "downloadSession.db")
);

downloadSessionDB.exec(`
  CREATE TABLE IF NOT EXISTS downloadSession (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    torrentID TEXT,
    compressionJobID INTEGER,
    downloadPath TEXT,
    status TEXT DEFAULT 'downloading',
    progress REAL DEFAULT 0.0,
    startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    endTime DATETIME,
    errorMessage TEXT,
    lastHeartbeat DATETIME DEFAULT CURRENT_TIMESTAMP
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
    "UPDATE downloadSession SET progress = ?, status = 'downloading', lastHeartbeat = CURRENT_TIMESTAMP WHERE id = ?"
  );
  stmt.run(progress, id);
}

function updateDownloadCompressionJob(id: number, compressionJobID: number) {
  const stmt = downloadSessionDB.prepare(
    "UPDATE downloadSession SET compressionJobID = ? WHERE id = ?"
  );
  stmt.run(compressionJobID, id);
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

function getDownloadSessionByTorrentID(torrentID: string): any {
  const stmt = downloadSessionDB.prepare(
    "SELECT * FROM downloadSession WHERE torrentID = ? ORDER BY startTime DESC LIMIT 1"
  );
  return stmt.get(torrentID);
}

function isTorrentDownloading(torrentID: string): boolean {
  const session = getDownloadSessionByTorrentID(torrentID);
  return session && session.status === "downloading";
}

function isTorrentCompleted(torrentID: string): boolean {
  const session = getDownloadSessionByTorrentID(torrentID);
  return session && session.status === "completed";
}

function isTorrentPaused(torrentID: string): boolean {
  const session = getDownloadSessionByTorrentID(torrentID);
  return session && session.status === "paused";
}

function markStaleDownloadsAsPaused(timeoutSeconds = 15) {
  const stmt = downloadSessionDB.prepare(
    `UPDATE downloadSession 
     SET status = 'paused' 
     WHERE status = 'downloading' 
     AND strftime('%s', 'now') - strftime('%s', lastHeartbeat) > ?`
  );

  const result = stmt.run(timeoutSeconds);
  return result.changes;
}

export {
  downloadSessionDB,
  markStaleDownloadsAsPaused,
  updateDownloadCompressionJob,
  getDownloadSessionByTorrentID,
  isTorrentPaused,
  isTorrentDownloading,
  isTorrentCompleted,
  updateDownloadPath,
  createDownloadSessionDB,
  updateDownloadProgress,
  markDownloadDone,
  markDownloadError,
};

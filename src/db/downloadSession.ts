import Database, { Database as DatabaseType } from "better-sqlite3";

const downloadSessionDB: DatabaseType = new Database("downloadSession.db", {
  verbose: console.log,
});

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
    "INSERT into torrents(torrentID, downloadPath,status) VALUES(?,?,?,?)"
  );
  const result = stmt.run(torrentID, downloadPath);

  return result.lastInsertRowid;
}

export { downloadSessionDB, createDownloadSessionDB };

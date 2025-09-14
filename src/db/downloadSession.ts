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

export default downloadSessionDB;

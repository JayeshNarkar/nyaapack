import Database, { Database as DatabaseType } from "better-sqlite3";

const compressionJobDB: DatabaseType = new Database("compressionJob.db", {
  verbose: console.log,
});

compressionJobDB.exec(`
  CREATE TABLE IF NOT EXISTS compressionJob (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    originalPath TEXT,
    compressedPath TEXT,
    compressedRatio TEXT,
    startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    endTime DATETIME
  )
`);

export default compressionJobDB;

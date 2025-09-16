import Database, { Database as DatabaseType } from "better-sqlite3";
import path from "path";
import { __dirname } from "../index.js";

const compressionJobDB: DatabaseType = new Database(
  path.join(__dirname, "compressionJob.db"),
  {
    verbose: console.log,
  }
);

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

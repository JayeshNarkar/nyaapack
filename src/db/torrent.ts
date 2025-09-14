import Database, { Database as DatabaseType } from "better-sqlite3";

const torrentsDB: DatabaseType = new Database("torrents.db", {
  verbose: console.log,
});

torrentsDB.exec(`
  CREATE TABLE IF NOT EXISTS torrents (
    id TEXT PRIMARY KEY,
    name TEXT,
    filesize TEXT,
    magnet TEXT    
  )
`);

export default torrentsDB;

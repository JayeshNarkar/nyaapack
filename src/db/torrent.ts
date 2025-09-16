import Database, { Database as DatabaseType } from "better-sqlite3";
import { TorrentSchema } from "../utils/types.js";

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

function addTorrentToDB(torrent: TorrentSchema) {
  const stmt = torrentsDB.prepare(
    "INSERT into torrents(id, name, filesize, magnet) VALUES(?,?,?,?)"
  );
  const result = stmt.run(
    torrent.id,
    torrent.name,
    torrent.filesize,
    torrent.magnet
  );
  return result.lastInsertRowid;
}

export { torrentsDB, addTorrentToDB };

import Database, { Database as DatabaseType } from "better-sqlite3";
import { TorrentSchema } from "../utils/types.js";
import path from "path";
import { __dirname } from "../index.js";

const torrentsDB: DatabaseType = new Database(
  path.join(__dirname, "torrents.db")
);

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
    "INSERT into torrents (id, name, filesize, magnet) VALUES(?,?,?,?)"
  );
  const result = stmt.run(
    torrent.id,
    torrent.name,
    torrent.filesize,
    torrent.magnet
  );
  return result.lastInsertRowid;
}

function getTorrentByID(torrentID: string): any {
  const stmt = torrentsDB.prepare("SELECT * FROM torrents WHERE id = ?");
  return stmt.get(torrentID);
}

export { torrentsDB, addTorrentToDB, getTorrentByID };

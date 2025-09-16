import WebTorrent from "webtorrent";
import { downloadDir } from "../index.js";
import {
  ensureDownloadDir,
  formatBytes,
  formatTimeRemaining,
} from "./helper.js";
import { TorrentSchema } from "./types.js";

import { torrentsDB } from "../db/torrent.js";
import { downloadSessionDB } from "../db/downloadSession.js";

const client = new WebTorrent();

function addTorrent(torrent: TorrentSchema) {
  ensureDownloadDir();

  const insertTorrent = torrentsDB.prepare(`
    INSERT OR IGNORE INTO torrents (id, name, filesize, magnet)
    VALUES (?, ?, ?, ?)
  `);
  insertTorrent.run(torrent.id, torrent.name, torrent.filesize, torrent.magnet);

  const insertSession = downloadSessionDB.prepare(`
    INSERT INTO downloadSession (torrentID, downloadPath, status)
    VALUES (?, ?, ?)
  `);
  const sessionInfo = insertSession.run(torrent.id, downloadDir, "downloading");

  console.log(`🔗 Adding torrent from magnet URI...`);
  const webtorrentInstance = client.add(torrent.magnet, { path: downloadDir });

  return {
    torrentInstance: webtorrentInstance,
    sessionId: sessionInfo.lastInsertRowid,
  };
}

function displayTorrentProgress(torrent: WebTorrent.Torrent) {
  console.clear();
  console.log("📊 Download Status:");
  console.log(
    `💾 Total downloaded: ${formatBytes(torrent.downloaded)}/${formatBytes(
      torrent.length
    )}`
  );
  console.log(`⚡ Download speed: ${formatBytes(torrent.downloadSpeed)}/s`);
  console.log(`📈 Progress: ${(torrent.progress * 100).toFixed(2)}%`);
  console.log(`👥 Peers: ${torrent.numPeers}`);
  console.log(`⏰ Time remaining: ${formatTimeRemaining(torrent)}`);
}

export { addTorrent, displayTorrentProgress };

import { downloadDir } from "../index.js";
import {
  ensureDownloadDir,
  formatBytes,
  formatTimeRemaining,
  getTorrentRelativeName,
} from "./helper.js";
import { TorrentSchema } from "./types.js";
import { client } from "../services/torrent.js";
import WebTorrent from "webtorrent";
import {
  markDownloadDone,
  markDownloadError,
  updateDownloadPath,
  updateDownloadProgress,
} from "../db/downloadSession.js";

import logUpdate from "log-update";

let lastUpdateTime = 0;
const UPDATE_INTERVAL_MS = 250;

function addTorrent(torrent: TorrentSchema, downloadSessionID?: number) {
  ensureDownloadDir();

  console.log(`🔗 Adding torrent from magnet URI...`);
  const webtorrentInstance = client.add(torrent.magnet, { path: downloadDir });

  let progressInterval: NodeJS.Timeout | null = null;

  webtorrentInstance.on("ready", () => {
    const relativePath = getTorrentRelativeName(webtorrentInstance);
    updateDownloadPath(downloadSessionID as number, relativePath as string);

    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      try {
        const now = Date.now();
        if (now - lastUpdateTime >= UPDATE_INTERVAL_MS) {
          displayTorrentProgress(webtorrentInstance);
          lastUpdateTime = now;
        }

        if (typeof downloadSessionID === "number") {
          updateDownloadProgress(
            downloadSessionID,
            webtorrentInstance.progress
          );
        }
      } catch (err) {
        console.error("Progress update error:", err);
      }
    }, 100);
  });

  webtorrentInstance.on("done", () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    displayTorrentProgress(webtorrentInstance);
    if (typeof downloadSessionID === "number") {
      markDownloadDone(downloadSessionID);
    }
    console.log("✅ Download completed:", webtorrentInstance.name);
  });

  (webtorrentInstance as any).on("error", (err: Error) => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    console.error("❌ Torrent error:", err);
    if (typeof downloadSessionID === "number") {
      markDownloadError(downloadSessionID, err.message || String(err));
    }
  });

  webtorrentInstance.on("download", () => {
    displayTorrentProgress(webtorrentInstance);
  });
}

function displayTorrentProgress(torrent: WebTorrent.Torrent) {
  const progressText = `
📊 Download Status:
💾 Total downloaded: ${formatBytes(torrent.downloaded)}/${formatBytes(
    torrent.length
  )}
⚡ Download speed: ${formatBytes(torrent.downloadSpeed)}/s
📈 Progress: ${(torrent.progress * 100).toFixed(2)}%
👥 Peers: ${torrent.numPeers}
⏰ Time remaining: ${formatTimeRemaining(torrent)}
  `.trim();

  logUpdate(progressText);
}

export { addTorrent, displayTorrentProgress };

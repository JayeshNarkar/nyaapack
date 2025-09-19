import { downloadDir } from "../index.js";
import {
  ensureDownloadDir,
  formatBytes,
  formatTimeRemaining,
  getTorrentRelativeName,
} from "../utils/helper.js";
import { TorrentSchema } from "../utils/types.js";
import { client } from "./download.js";
import WebTorrent from "webtorrent";
import {
  markDownloadDone,
  markDownloadError,
  updateDownloadPath,
  updateDownloadProgress,
} from "../db/downloadSession.js";

import { Logger } from "../utils/logger.js";

let lastUpdateTime = 0;
const UPDATE_THROTTLE_MS = 500;

function addTorrent(torrent: TorrentSchema, downloadSessionID?: number) {
  ensureDownloadDir();

  console.log(`🔗 Adding torrent from magnet URI...`);
  const webtorrentInstance = client.add(torrent.magnet, { path: downloadDir });

  let progressInterval: NodeJS.Timeout | null = null;

  webtorrentInstance.on("ready", () => {
    const relativePath = getTorrentRelativeName(webtorrentInstance);
    updateDownloadPath(downloadSessionID as number, relativePath as string);

    Logger.startProgress();

    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      try {
        displayTorrentProgress(webtorrentInstance);

        if (typeof downloadSessionID === "number") {
          const now = Date.now();
          if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
            updateDownloadProgress(
              downloadSessionID,
              webtorrentInstance.progress
            );
          }
        }
      } catch (err) {
        Logger.error("Progress update error:" + err);
      }
    }, 1000);
  });

  webtorrentInstance.on("done", () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    displayTorrentProgress(webtorrentInstance);
    Logger.stopProgress();
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
    Logger.stopProgress();
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

  Logger.updateProgress(progressText);
}

export { addTorrent, displayTorrentProgress };

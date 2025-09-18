import { downloadDir } from "../index.js";
import {
  ensureDownloadDir,
  formatBytes,
  formatTimeRemaining,
} from "./helper.js";
import { TorrentSchema } from "./types.js";
import { client } from "../services/torrent.js";
import WebTorrent from "webtorrent";
import {
  markDownloadDone,
  markDownloadError,
  updateDownloadProgress,
} from "../db/downloadSession.js";

function addTorrent(torrent: TorrentSchema, downloadSessionID?: number) {
  ensureDownloadDir();

  console.log(`🔗 Adding torrent from magnet URI...`);
  const webtorrentInstance = client.add(torrent.magnet, { path: downloadDir });

  let progressInterval: NodeJS.Timeout | null = null;

  webtorrentInstance.on("ready", () => {
    try {
      const files = webtorrentInstance.files || [];
      let relativeName: string;
      if (files.length === 1) {
        // single file: store the filename
        relativeName = files[0].name;
      } else {
        // multi-file: prefer the torrent.name (usually top-level folder)
        // fallback: determine common top-level directory if available
        const topLevels = new Set(
          files.map((f) => {
            const parts = f.path.split("/").filter(Boolean);
            return parts.length > 0 ? parts[0] : f.name;
          })
        );
        relativeName =
          topLevels.size === 1
            ? Array.from(topLevels)[0]
            : (webtorrentInstance.name as string);
      }

      if (typeof downloadSessionID === "number") {
        // store relative name; to get absolute path later: path.join(downloadDir, relativeName)
        updateDownloadPath(downloadSessionID, relativeName);
      }
    } catch (err) {
      console.error("Error determining torrent target path:", err);
    }
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      try {
        displayTorrentProgress(webtorrentInstance);
        if (typeof downloadSessionID === "number") {
          updateDownloadProgress(
            downloadSessionID,
            webtorrentInstance.progress
          );
        }
      } catch (err) {
        console.error("Progress update error:", err);
      }
    }, 1000);
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
function updateDownloadPath(downloadSessionID: number, relativeName: string) {
  throw new Error("Function not implemented.");
}

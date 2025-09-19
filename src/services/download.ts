import {
  createDownloadSessionDB,
  getDownloadSessionByTorrentID,
  isTorrentCompleted,
  isTorrentDownloading,
  isTorrentPaused,
  markStaleDownloadsAsPaused,
} from "../db/downloadSession.js";
import { addTorrentToDB, getTorrentByID } from "../db/torrent.js";
import { downloadDir } from "../index.js";
import { StatusResponse, TorrentSchema } from "../utils/types.js";
import WebTorrent from "webtorrent";
import { addTorrent } from "./web_torrent_client.js";

export const client = new WebTorrent();

function startDownload(torrent: TorrentSchema | undefined): StatusResponse {
  markStaleDownloadsAsPaused();
  try {
    if (!torrent) {
      return {
        status: 500,
        message: "Torrent object cannot be empty",
      };
    }
    const existingTorrent = getTorrentByID(torrent.id);

    if (existingTorrent) {
      if (isTorrentDownloading(torrent.id)) {
        return {
          status: 409,
          message: "Torrent is already being downloaded in another session",
        };
      }

      if (isTorrentCompleted(torrent.id)) {
        return {
          status: 409,
          message:
            "Torrent already exists and has been completed. Check progress",
        };
      }

      if (isTorrentPaused(torrent.id)) {
        const latestSession = getDownloadSessionByTorrentID(torrent.id);
        console.log(`🔄 Resuming paused/stopped download for: ${torrent.name}`);
        addTorrent(torrent, Number(latestSession.id));
        return {
          status: 200,
          message: "Torrent has started downloading successfully!",
        };
      }
      return {
        status: 500,
        message: "Torrent probably exited with error! (run 'npm run cleanup')",
      };
    } else {
      const torrentID = addTorrentToDB(torrent);

      if (!torrentID) {
        return {
          status: 500,
          message: "Error in Creating torrent entry",
        };
      }

      const downloadSessionID = createDownloadSessionDB(
        torrent.id,
        downloadDir
      );

      if (!downloadSessionID) {
        return {
          status: 500,
          message: "Error in Creating download session entry",
        };
      }

      addTorrent(torrent, Number(downloadSessionID));

      return {
        status: 200,
        message: "Torrent has started downloading successfully!",
      };
    }
  } catch (error: any) {
    if (
      (error?.code && error?.code === "SQLITE_CONSTRAINT_PRIMARYKEY") ||
      (typeof error.message === "string" &&
        error.message.includes("UNIQUE constraint failed"))
    ) {
      return {
        status: 409,
        message: "Torrent already exists in the database.",
      };
    }
    return {
      status: 500,
      message: "Internal Error!",
    };
  }
}

export { startDownload };

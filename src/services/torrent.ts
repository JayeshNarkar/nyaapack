import { createDownloadSessionDB } from "../db/downloadSession.js";
import { addTorrentToDB } from "../db/torrent.js";
import { downloadDir } from "../index.js";
import { StatusResponse, TorrentSchema } from "../utils/types.js";
import WebTorrent from "webtorrent";
import { addTorrent } from "./web_torrent_client.js";

export const client = new WebTorrent();

function startDownload(torrent: TorrentSchema | undefined): StatusResponse {
  try {
    if (!torrent) {
      return {
        status: 500,
        message: "Torrent object cannot be empty",
      };
    }
    const torrentID = addTorrentToDB(torrent);

    if (!torrentID) {
      return {
        status: 500,
        message: "Error in Creating torrent entry",
      };
    }

    const downloadSessionID = createDownloadSessionDB(torrent.id, downloadDir);

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

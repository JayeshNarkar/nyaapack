import { createDownloadSessionDB } from "../db/downloadSession.js";
import { addTorrentToDB } from "../db/torrent.js";
import { downloadDir } from "../index.js";
import { StatusResponse, TorrentSchema } from "../utils/types.js";

function startDownload(torrent: TorrentSchema | undefined): StatusResponse {
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

  return {
    status: 200,
    message: "Torrent has started downloading successfully!",
  };
}

export { startDownload };

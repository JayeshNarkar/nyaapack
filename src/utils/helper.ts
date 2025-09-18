import WebTorrent from "webtorrent";
import { downloadDir } from "../index.js";
import fs from "fs";
import inquirer from "inquirer";
import { TorrentSchema } from "./types.js";

function filterTorrents(
  torrents: TorrentSchema[],
  filter: string,
  audio: string
): TorrentSchema[] {
  let filtered = torrents;

  if (filter) {
    filtered = filtered.filter((torrent) =>
      torrent.name.toLowerCase().includes(filter)
    );
  }

  if (audio) {
    filtered = filtered.filter((torrent) => {
      const torrentAudioType = getAudioType(torrent).toLowerCase();

      if (audio === "dual-audio" || audio === "dual") {
        return torrentAudioType === "dual-audio";
      } else if (audio === "dubbed" || audio === "dub") {
        return torrentAudioType === "dubbed";
      } else {
        return torrentAudioType === "undefined";
      }
    });
  }

  return filtered;
}

function getTorrentQuality(torrent: TorrentSchema) {
  const name = torrent.name.toLowerCase();
  const qualityMatch = name.match(/(\d{3,4}p)/i);
  return qualityMatch ? qualityMatch[1] : "Unknown";
}

function getAudioType(
  torrent: TorrentSchema
): "undefined" | "Dual-Audio" | "Dubbed" {
  const name = torrent.name.toLowerCase();

  if (name.includes("dual")) {
    return "Dual-Audio";
  } else if (name.includes("dub")) {
    return "Dubbed";
  }

  return "undefined";
}

function ensureDownloadDir() {
  if (!fs.existsSync(downloadDir))
    fs.mkdirSync(downloadDir, { recursive: true });
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

function formatTimeRemaining(torrent: WebTorrent.Torrent) {
  if (!torrent.downloadSpeed || torrent.downloadSpeed === 0) {
    return "Unknown";
  }

  const remainingBytes = torrent.length - torrent.downloaded;
  const secondsRemaining = remainingBytes / torrent.downloadSpeed;

  if (secondsRemaining > 3600) {
    return `${(secondsRemaining / 3600).toFixed(1)} hours`;
  } else if (secondsRemaining > 60) {
    return `${(secondsRemaining / 60).toFixed(1)} minutes`;
  } else {
    return `${secondsRemaining.toFixed(0)} seconds`;
  }
}

function getTorrentRelativeName(torrent: WebTorrent.Torrent): string {
  const files = torrent.files || [];
  let relativeName: string;

  if (files.length === 1 && files[0]) {
    relativeName = `${downloadDir}/${files[0].name}`;
  } else {
    const topLevels = new Set(
      files.map((f) => {
        const parts = f.path.split("/").filter(Boolean);
        return parts.length > 0 ? parts[0] : f.name;
      })
    );

    if (topLevels.size === 1) {
      relativeName = `${downloadDir}/${Array.from(topLevels)[0]}`;
    } else {
      relativeName = `${downloadDir}/${torrent.name || "unknown_torrent"}`;
    }
  }

  console.log("Relative path:", relativeName);
  return relativeName;
}

export async function promptForSelection(maxIndex: number): Promise<number> {
  const { selection } = await inquirer.prompt({
    type: "number",
    name: "selection",
    message: `Select a torrent (1-${maxIndex}):`,
    validate: (input: number | undefined) => {
      if (input === undefined)
        return `Please enter a number between 1 and ${maxIndex}`;
      return input >= 1 && input <= maxIndex
        ? true
        : `Please enter a number between 1 and ${maxIndex}`;
    },
  });

  return selection - 1;
}

async function promptUserBoolean(prompt: string): Promise<boolean> {
  const { confirmation } = await inquirer.prompt({
    type: "confirm",
    name: "confirmation",
    message: prompt,
    default: true,
  });

  return confirmation;
}

export {
  getTorrentRelativeName,
  filterTorrents,
  getTorrentQuality,
  getAudioType,
  promptUserBoolean,
  ensureDownloadDir,
  formatBytes,
  formatTimeRemaining,
};

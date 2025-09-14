import WebTorrent from "webtorrent";
import { downloadDir } from "../index.js";
import fs from "fs";
import readline from "readline";
import inquirer from "inquirer";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptUserBoolean(prompt: String): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    rl.question(`${prompt} (y/n, default: y): `, (answer: string) => {
      resolve(answer.toLowerCase() !== "n");
      rl.close();
    });
  });
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

export async function promptForSelection(maxIndex: number): Promise<number> {
  const { selection } = await inquirer.prompt({
    type: "number",
    name: "selection",
    message: `Select torrent (1-${maxIndex}):`,
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

export {
  promptUserBoolean,
  ensureDownloadDir,
  formatBytes,
  formatTimeRemaining,
};

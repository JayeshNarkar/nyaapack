import Table from "cli-table3";
import chalk from "chalk";

export function displayTorrentTable(torrents: any[]) {
  const table = new Table({
    head: ["#", "Name", "Size", "Seeders", "Quality"],
    colWidths: [5, 60, 15, 10, 15],
  });

  torrents.forEach((torrent, index) => {
    table.push([
      index + 1,
      torrent.name,
      torrent.filesize,
      torrent.seeders,
      torrent.name,
    ]);
  });

  console.log(table.toString());
}

export function displayProgressTable(downloads: any[]) {
  const table = new Table({
    head: ["ID", "Name", "Progress", "Status", "Added"],
    colWidths: [5, 50, 15, 15, 20],
  });

  downloads.forEach((download) => {
    const progress =
      download.status === "completed"
        ? "100%"
        : `${(download.progress * 100).toFixed(1)}%`;
    const statusColor =
      download.status === "completed"
        ? chalk.green
        : download.status === "error"
        ? chalk.red
        : chalk.yellow;

    table.push([
      download.id,
      download.name,
      progress,
      statusColor(download.status),
      new Date(download.created_at).toLocaleDateString(),
    ]);
  });

  console.log(table.toString());
}

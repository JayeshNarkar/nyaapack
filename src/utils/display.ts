import Table from "cli-table3";
import { TorrentSchema } from "./types.js";
import { getAudioType, getTorrentQuality } from "./helper.js";

export function displayTorrentTable(torrents: TorrentSchema[]) {
  const table = new Table({
    head: ["#", "Name", "Size", "Seeds", "Quality", "Audio"],
    colWidths: [5, 60, 15, 8, 10, 15],
    wordWrap: true,
  });

  torrents.forEach((torrent, index) => {
    const name = torrent.name;

    table.push([
      index + 1,
      name,
      torrent.filesize,
      torrent.seeders,
      getTorrentQuality(torrent),
      getAudioType(torrent),
    ]);
  });

  console.log(table.toString());
}

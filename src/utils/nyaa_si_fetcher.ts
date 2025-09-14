import { si } from "nyaapi";
import { TorrentSchema } from "./types.js";

export async function NyaaSiFetcher(
  animeName: string,
  numOfResults: number = 5
): Promise<TorrentSchema[]> {
  try {
    const results = await si.search(animeName, numOfResults, {
      sort: "seeders",
    });

    return results.map((torrent) => ({
      id: torrent.id,
      name: torrent.name,
      filesize: torrent.filesize,
      magnet: torrent.magnet,
      seeders: torrent.seeders,
    }));
  } catch (error) {
    console.error("Error fetching from Nyaa.si:", error);
    throw error;
  }
}

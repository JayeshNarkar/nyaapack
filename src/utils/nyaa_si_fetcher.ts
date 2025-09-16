import { si } from "nyaapi";
import { TorrentSchema } from "./types.js";

export async function NyaaSiFetcher(
  animeName: string,
  numOfResults: number = 5,
  sort: string = "seeders"
): Promise<TorrentSchema[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Nyaa.si request timeout - site may be down")),
        10000
      )
    );

    console.log(
      `🔍 Searching Nyaa.si for: "${animeName}" (${numOfResults} results)`
    );

    const searchPromise = si.search(animeName.toLowerCase(), numOfResults, {
      sort,
    });

    const results = await Promise.race([searchPromise, timeoutPromise]);

    console.log(`✅ Found ${results.length} results`);
    return results.map((torrent) => ({
      id: torrent.id,
      name: torrent.name,
      filesize: torrent.filesize,
      magnet: torrent.magnet,
      seeders: torrent.seeders,
    }));
  } catch (error: any) {
    if (
      error.message.includes("timeout") ||
      error.message.includes("ENOTFOUND")
    ) {
      throw new Error(
        `Nyaa.si is currently unavailable. Please check:\n• https://downforeveryoneorjustme.com/nyaa.si\n• Try using a VPN\n• Try again later`
      );
    }

    throw error;
  }
}

import { Command } from "commander";
import { NyaaSiFetcher } from "../utils/nyaa_si_fetcher.js";
import { displayTorrentTable } from "../utils/display.js";

export default function downloadCommand() {
  const command = new Command("download")
    .description("Download torrents from Nyaa.si")
    .argument("<query>", "Search query")
    .option("-n, --number <number>", "Number of results to show", "5")
    .option("--progress", "Show download progress", false)
    .action(async (query, options) => {
      try {
        const numResults = parseInt(options.number);
        const results = await NyaaSiFetcher(query, numResults);

        // show torrent options
        // prompt to select one
        // start download

        if (!options.progress) {
          console.log(
            '🚀 Download started in background. Use "nyaasitorrenter progress" to check status.'
          );
        }
      } catch (error: any) {
        console.error("❌ Error:", error.message);
      }
    });

  return command;
}

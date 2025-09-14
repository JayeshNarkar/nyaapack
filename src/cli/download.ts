import { Command } from "commander";
import { NyaaSiFetcher } from "../utils/nyaa_si_fetcher.js";
import { displayTorrentTable } from "../utils/display.js";

export default function downloadCommand() {
  const command = new Command("download")
    .description("Download torrents from Nyaa.si")
    .argument("<query>", "Search query")
    .option("-n, --number <number>", "Number of results to show", "5")
    .option("--progress", "Show download progress", false)
    .option("-f, --filter <string>", "Filter results by text in name", "")
    .action(async (query, options) => {
      try {
        const numResults = parseInt(options.number);
        const results = await NyaaSiFetcher(query, numResults);

        let filteredResults = results;
        if (options.filter) {
          const filterText = options.filter.toLowerCase();
          filteredResults = results.filter((torrent) =>
            torrent.name.toLowerCase().includes(filterText)
          );
        }

        displayTorrentTable(filteredResults);
        // prompt to select one
        // start download

        // if (!options.progress) {
        //   console.log(
        //     '🚀 Download started in background. Use "nyaasitorrenter progress" to check status.'
        //   );
        // }
      } catch (error: any) {
        console.error("❌ Error:", error.message);
      }
    });

  return command;
}

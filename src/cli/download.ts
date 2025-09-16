import { Command } from "commander";
import { NyaaSiFetcher } from "../utils/nyaa_si_fetcher.js";
import { displayTorrentTable } from "../utils/display.js";
import {
  filterTorrents,
  promptForSelection,
  promptUserBoolean,
} from "../utils/helper.js";
import { startDownload } from "../services/torrent.js";

export default function downloadCommand() {
  const command = new Command("download")
    .description("Download torrents from Nyaa.si")
    .argument("<query>", "Search query")
    .option("-n, --number <number>", "Number of results to show", "5")
    .option("--progress", "Show download progress", false)
    .option(
      "-f, --filter <string>",
      "Filter results by text in name. (Note: you may have to increase -n to find what youre looking for)",
      ""
    )
    .option(
      "--audio <string>",
      "Audio type for the torrent (dual, dub, undefined)",
      ""
    )
    .action(async (query, options) => {
      try {
        const numResults = parseInt(options.number);
        const results = await NyaaSiFetcher(query, numResults);

        const filteredResults = filterTorrents(
          results,
          options.filter.toLowerCase(),
          options.audio.toLowerCase()
        );

        const numFilteredResults = filteredResults.length;

        if (numFilteredResults == 0) {
          startDownload(filteredResults[0]);
        } else if (numFilteredResults == 1) {
          displayTorrentTable(filteredResults);
          const choice = await promptUserBoolean(
            "Do you wish to download the only result? "
          );
          if (choice == true) {
            console.log("Download start for " + filteredResults[0]?.name);
          }
        } else {
          displayTorrentTable(filteredResults);

          const choiceCode = await promptForSelection(numFilteredResults);

          startDownload(filteredResults.at(choiceCode));

          // if (!options.progress) {
          //   console.log(
          //     '🚀 Download started in background. Use "nyaasitorrenter progress" to check status.'
          //   );
          // }
        }
      } catch (error: any) {
        console.error("❌ Error:", error.message);
        process.exit(1);
      }
    });

  return command;
}

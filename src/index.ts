import { promptUserBoolean } from "./utils/helper.js";
import { NyaaSiFetcher } from "./utils/nyaa_si_fetcher.js";
import { TorrentSchema } from "./utils/types.js";
import {
  addTorrent,
  displayTorrentProgress,
} from "./utils/web_torrent_client.js";

export const downloadDir = "AnimeDownload";

async function test() {
  const result = await NyaaSiFetcher("Blue Lock", 1);
  const torrent = addTorrent(result[0] as TorrentSchema);
  let showProgress = await promptUserBoolean("Show download progress?");
}

test();

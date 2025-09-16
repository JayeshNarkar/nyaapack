// import { promptUserBoolean } from "./utils/helper.js";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.resolve(dirname(__filename), "..");

export const downloadDir = path.join(__dirname, "Downloads");

//   let showProgress = await promptUserBoolean("Show download progress?");

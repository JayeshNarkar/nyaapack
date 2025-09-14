import { Command } from "commander";
import downloadCommand from "./download.js";

const program = new Command();

program
  .name("nyaapack")
  .description("CLI tool for downloading torrents from Nyaa.si")
  .version("1.0.0");

program.addCommand(downloadCommand());

export default program;

import { Command } from "commander";
import {
  generateContext,
  DirectoryProcessor,
  generateIndexMd,
  OllamaSummarizer,
  OpenAISummarizer,
  cleanupContext,
} from "./index-md";
import { DirectoryCleaner } from "./index-md/directory-processor/directory-cleaner";

const program = new Command();

program
  .version("1.0.0")
  .description("Cleanup Index.md files for directories")
  .argument("<dirPath>", "Directory path to process")
  .option("-j, --json", "Remove .index.json files", true)
  .action(async (dirPath, options) => {
    try {
      cleanupContext.setOpts({
        json: options.json,
      });

      await new DirectoryCleaner().deleteIndexFiles(dirPath);
    } catch (error) {
      console.error("Error generating Index.md files:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);

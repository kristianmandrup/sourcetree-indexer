import { Command } from "commander";
import {
  appContext,
  DirectoryProcessor,
  generateIndexMd,
  OllamaSummarizer,
  OpenAISummarizer,
} from "./index-md";
import { DirectoryCleaner } from "./index-md/directory-processor/directory-cleaner";

const program = new Command();

program
  .version("1.0.0")
  .description("Cleanup Index.md files for directories")
  .argument("<dirPath>", "Directory path to process")
  .action(async (dirPath, options) => {
    try {
      await new DirectoryCleaner().deleteIndexFiles(dirPath);
    } catch (error) {
      console.error("Error generating Index.md files:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);

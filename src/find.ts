import { Command } from "commander";
import {
  findContext,
  DirectoryFinder,
} from "./index-md/directory-processor/finder";

const program = new Command();

program
  .version("1.0.0")
  .description("Find directories that best matching search term")
  .argument("<dirPath>", "Directory path to process")
  .option("-s, --search", "Search term")
  .option("-t, --tags", "Tags to search for")
  .action(async (dirPath, options) => {
    try {
      const { tags, search } = options;
      if (!search) {
        console.error(
          "Missing search term:\nTo see runtime options available:\nsearch-sourcetree -h"
        );
        process.exit(1);
      }

      findContext.setOpts({
        tags,
      });

      await new DirectoryFinder(search).findFrom(dirPath);
    } catch (error) {
      console.error("Error generating Index.md files:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);

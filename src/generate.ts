import { Command } from "commander";
import {
  appContext,
  generateIndexMd,
  OllamaSummarizer,
  OpenAISummarizer,
} from "./index-md";

const program = new Command();

program
  .version("1.0.0")
  .description("Generate Index.md files for directories")
  .argument("<dirPath>", "Directory path to process")
  .option(
    "-a, --apiKey <apiKey>",
    "API key for the summarizer service (currently only for OpenAI)",
    process.env.OPENAI_API_KEY || ""
  )
  .option("-m, --model <model>", "Model name", "phi3:mini")
  .option(
    "-s, --service <service>",
    'Summarizer service: "openai" or "ollama"',
    "ollama"
  )
  .option("-u, --suggest", "Make improvement suggestions", false)
  .option("-t, --toc", "Table of Contents", false)
  .option("-y, --types", "Summarize types, interfaces and enums", false)
  .option("-n, --analyze", "Perform code and complexity analysis", false)
  .option("-f, --force", "Force processing of all files", false)
  .action(async (dirPath, options) => {
    let summarizer;

    appContext.setOpts({
      analyze: options.analyze,
      suggest: options.suggest,
      toc: options.toc,
      types: options.types,
      force: options.force,
    });

    if (options.service === "openai") {
      if (!options.apiKey) {
        console.error("API key is required for OpenAI");
        process.exit(1);
      }

      summarizer = new OpenAISummarizer(options.model, options.apiKey);
    } else if (options.service === "ollama") {
      summarizer = new OllamaSummarizer(options.model);
    } else {
      console.error('Invalid summarizer service. Use "openai" or "ollama".');
      process.exit(1);
    }

    try {
      await generateIndexMd(dirPath, summarizer);
    } catch (error) {
      console.error("Error generating Index.md files:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);

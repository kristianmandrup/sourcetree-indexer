#!/usr/bin/env node

import { Command } from "commander";
import { generateIndexMd, OllamaSummarizer, OpenAISummarizer } from ".";

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
  .option("-m, --model <model>", "Model name")
  .option(
    "-s, --service <service>",
    'Summarizer service: "openai" or "ollama"',
    "openai"
  )
  .action(async (dirPath, options) => {
    let summarizer;
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
      console.log("Index.md files generated successfully.");
    } catch (error) {
      console.error("Error generating Index.md files:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);

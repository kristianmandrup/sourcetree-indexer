import { OpenAISummarizer } from "./openai-summarizer";
import { readFileSummary } from "./read-file-summary";

// Example usage
(async () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OLLAMA_API_KEY || "";
  const summarizer = new OpenAISummarizer(apiKey); // or new OllamaSummarizer(apiKey)

  const filePath = "path/to/your/file.ts";
  const summaries = await readFileSummary(filePath, summarizer);

  console.log(summaries);
})();

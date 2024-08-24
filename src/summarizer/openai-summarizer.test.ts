// testSummarizer.ts

import dotenv from "dotenv";
import { OpenAISummarizer } from "./openai-summarizer";

dotenv.config();

(async () => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not defined in environment variables."
      );
    }

    const summarizer = new OpenAISummarizer(apiKey);

    const text = `
      LangChain is a framework for developing applications powered by language models.
      It enables developers to chain together different components such as prompts, models,
      and parsers to build more complex and powerful applications.
    `;

    const summary = await summarizer.summarize(text);

    console.log("Summary:", summary);
  } catch (error) {
    console.error("Error:", error);
  }
})();

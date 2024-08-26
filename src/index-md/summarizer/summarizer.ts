import { OpenAISummarizer } from "./openai-summarizer";
import { OllamaSummarizer } from "./ollama-summarizer";

export interface Summarizer {
  summarize(text: string, prompt?: string): Promise<string>;
}

export class AISummarizer {
  private summarizer: Summarizer;

  constructor(provider: "openai" | "ollama") {
    if (provider === "openai") {
      this.summarizer = new OpenAISummarizer(process.env.OPENAI_API_KEY!);
    } else if (provider === "ollama") {
      this.summarizer = new OllamaSummarizer();
    } else {
      throw new Error("Unsupported provider");
    }
  }

  async summarize(text: string): Promise<string> {
    if (text.trim() === "") return "";
    return (await this.summarizer.summarize(text)) + "";
  }
}

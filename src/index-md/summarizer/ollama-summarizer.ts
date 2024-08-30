import { ChatOllama } from "@langchain/ollama";
import { BaseSummarizer, type ISummarizer } from "./summarizer"; // Assuming you have a common Summarizer interface

export class OllamaSummarizer extends BaseSummarizer {
  private model: ChatOllama;

  constructor(modelName: string = "llama3") {
    super();
    this.model = new ChatOllama({
      model: modelName,
    });
  }

  public async summarize(text: string, question?: string): Promise<string> {
    const prompt = this.createPrompt(question || this.defaultQuestion, text);
    const response = await this.model.invoke(["human", prompt]);
    const { content } = response;
    if (content.length > 0) {
      if (typeof content === "string") {
        return this.stripQuotes(content.trim());
      }
      return "";
    } else {
      throw new Error("Unexpected response format from Ollama model.");
    }
  }
}

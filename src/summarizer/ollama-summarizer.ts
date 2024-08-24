import { ChatOllama } from "@langchain/ollama";
import { type Summarizer } from "./summarizer"; // Assuming you have a common Summarizer interface

export class OllamaSummarizer implements Summarizer {
  private model: ChatOllama;

  constructor(modelName: string = "llama3") {
    this.model = new ChatOllama({
      model: modelName,
    });
  }

  public async summarize(text: string): Promise<string | undefined> {
    const prompt = `Please provide a concise and clear summary of the following text:\n\n"${text}"`;
    const response = await this.model.invoke(["human", prompt]);
    const { content } = response;
    if (content.length > 0) {
      const message = content[0];
      if (typeof message === "string") {
        return message.trim();
      }
    } else {
      throw new Error("Unexpected response format from Ollama model.");
    }
  }
}

import { ChatOllama } from "@langchain/ollama";
import { type Summarizer } from "./summarizer"; // Assuming you have a common Summarizer interface

export class OllamaSummarizer implements Summarizer {
  private model: ChatOllama;

  constructor(modelName: string = "llama3") {
    this.model = new ChatOllama({
      model: modelName,
    });
  }

  private createPrompt(question: string, text: string) {
    return `${question} (keep it very brief and to the point):\n\n"${text}"`;
  }

  public async summarize(text: string, question?: string): Promise<string> {
    const defaultQuestion = `Please provide a concise and clear summary of the following`;
    const prompt = this.createPrompt(question || defaultQuestion, text);
    const response = await this.model.invoke(["human", prompt]);
    const { content } = response;
    if (content.length > 0) {
      if (typeof content === "string") {
        return content.trim();
      }
      return "";
    } else {
      throw new Error("Unexpected response format from Ollama model.");
    }
  }
}

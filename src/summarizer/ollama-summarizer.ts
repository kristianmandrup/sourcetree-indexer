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
    console.log("prompt", prompt);
    const response = await this.model.invoke(["human", prompt]);
    const { content } = response;
    console.log(content);
    if (content.length > 0) {
      console.log("Ollama AI response message", content);
      if (typeof content === "string") {
        return content.trim();
      }
    } else {
      throw new Error("Unexpected response format from Ollama model.");
    }
  }
}

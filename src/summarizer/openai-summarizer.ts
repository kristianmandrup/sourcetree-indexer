// OpenAISummarizer.ts

import {
  AIMessage,
  HumanMessage,
  type MessageContentComplex,
  type MessageContentText,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { Summarizer } from "./summarizer";

export class OpenAISummarizer implements Summarizer {
  private model: ChatOpenAI;

  constructor(modelName: string = "gpt-4o", apiKey?: string) {
    const openAIApiKey = apiKey || process.env.OPENAI_API_KEY!;
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI key");
    }
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey || process.env.OPENAI_API_KEY!,
      modelName,
      temperature: 0.7,
    });
  }

  public async summarize(text: string): Promise<string | undefined> {
    const prompt = `Please provide a concise and clear summary of the following text:\n\n"${text}"`;
    const response = await this.model.invoke([new HumanMessage(prompt)]);
    if (response instanceof AIMessage) {
      const { content } = response;
      const message = content[0];
      if (typeof message === "string") {
        return message.trim();
      } else {
        const complex = (message as any)[0];
        return complex.text;
      }
    } else {
      throw new Error("Unexpected response type from OpenAI model.");
    }
  }
}

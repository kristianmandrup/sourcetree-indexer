import { appContext } from "../app-context";
import { SectionSummary } from "../directory-processor/types";
import { NodeSummary } from "./node";

export class CodeSuggester {
  prompt =
    "Provide a bullet list of code improvement and refactor suggestions for the following code. Consider especially refactoring patterns like Extract method/class and Return early to break the code into smaller composable parts and avoid deep nesting.";

  constructor(prompt?: string) {
    this.prompt = prompt || this.prompt;
  }

  async suggest(code: string, entry?: NodeSummary | SectionSummary) {
    if (!appContext.runtimeOpts.suggest) return;
    if (entry && entry.complexity && entry.complexity.score < 2) {
      console.log("not sufficiently complex to warrant any suggestions");
      return;
    }
    // console.log("Code suggestions for:", code);
    const suggestions = await this.getCodeImprovementSuggestions(code);
    if (entry) {
      entry.suggestions = suggestions;
    }
    return suggestions;
  }

  protected async getCodeImprovementSuggestions(
    code: string
  ): Promise<string | undefined> {
    return await appContext.summarizer?.summarize(code, this.prompt);
  }
}

import { appContext } from "../app-context";
import { NodeSummary } from "./node";

export type ComplexityLabel =
  | "Very low"
  | "Low"
  | "Medium"
  | "High"
  | "Very high";

export type CodeComplexity = {
  score: number;
  label: ComplexityLabel;
};

export class CodeAnalyzer {
  complexityScoreMap: Record<number, ComplexityLabel> = {
    1: "Very low",
    2: "Low",
    3: "Medium",
    4: "High",
    5: "Very high",
  };

  async analyze(
    code: string,
    entry?: NodeSummary
  ): Promise<CodeComplexity | undefined> {
    if (!appContext.runtimeOpts.analyze) return;
    console.log("Code complexity analysis for:", code);
    const complexity = await this.analyzeComplexity(code);
    if (entry) {
      entry.complexity = complexity;
    }
    return complexity;
  }

  protected async analyzeComplexity(
    code: string
  ): Promise<CodeComplexity | undefined> {
    const strScore = await appContext.summarizer?.summarize(
      code,
      "Estimate a complexity rating for the code as a number between 1-5 (1 = Very low, 2 = Low, 3 = Medium, 4 = High, 5 = Very high"
    );
    if (!strScore) {
      return;
    }
    const score = parseInt(strScore) || 3;
    const label = this.complexityScoreMap[score] || "Medium";
    return {
      score,
      label,
    };
  }
}

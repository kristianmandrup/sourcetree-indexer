import path from "node:path";
import {
  Project,
  SyntaxKind,
  ClassDeclaration,
  FunctionDeclaration,
  // MethodDeclaration,
  // VariableStatement,
  SourceFile,
} from "ts-morph";
import { parse } from "comment-parser";
import { Summarizer } from "./summarizer";

// Constants
export const SUPPORTED_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx"];

export interface FunctionOrClassSummary {
  name: string;
  summary: string;
  methods?: FunctionOrClassSummary[];
}

class FileSummarizer {
  private summarizer: Summarizer;

  constructor(summarizer: Summarizer) {
    this.summarizer = summarizer;
  }

  private extractJsDocDescription(jsDocText: string): string {
    const parsed = parse(jsDocText);
    return parsed.length > 0
      ? parsed[0].description || "No summary available."
      : "No summary available.";
  }

  private async summarizeNode(
    node: ClassDeclaration | FunctionDeclaration
  ): Promise<FunctionOrClassSummary | null> {
    const name = node.getSymbol()?.getName();
    const docSummary = this.extractJsDocDescription(node.getText());

    const aiDocSummary = ""; // await this.summarizer.summarize(docSummary);
    const aiNodeSummary = await this.summarizer.summarize(node.getText());

    console.log({ name, docSummary, aiNodeSummary });

    if (!name || (!aiDocSummary && !aiNodeSummary)) {
      console.log("skipped node summary");
      return null;
    }
    let summary = aiNodeSummary;
    const combined = aiDocSummary
      ? [aiDocSummary, aiNodeSummary].join("")
      : undefined;
    summary = combined
      ? (await this.summarizer.summarize(combined)) + ""
      : summary + "";

    const entry: FunctionOrClassSummary = { name, summary };

    if (node.getKind() === SyntaxKind.ClassDeclaration) {
      const methods = (node as ClassDeclaration)
        .getMethods()
        .filter((method) => method.getScope() === "public")
        .map(async (methodNode) => {
          const methodName = methodNode.getSymbol()?.getName();
          const methodDocSummary = this.extractJsDocDescription(
            methodNode.getText()
          );
          const methodAiSummary = await this.summarizer.summarize(
            methodDocSummary
          );
          return methodName && methodAiSummary
            ? { name: methodName, summary: methodAiSummary }
            : null;
        });

      entry.methods = (await Promise.all(methods)).filter(
        Boolean
      ) as FunctionOrClassSummary[];
    }

    return entry;
  }

  async getFunctionSummaries(sourceFile: SourceFile) {
    const summaries: FunctionOrClassSummary[] = [];

    // Extract exported functions
    for (const func of sourceFile.getFunctions()) {
      console.log("function", func.getName());
      if (func.isExported()) {
        const summary = await this.summarizeNode(func);
        if (summary) summaries.push(summary);
      } else {
        console.log("not exported");
      }
    }

    console.log("FUNCTIONS", summaries);
    return summaries;
  }

  async getClassSummaries(sourceFile: SourceFile) {
    const summaries: FunctionOrClassSummary[] = [];

    // Extract exported classes
    for (const cls of sourceFile.getClasses()) {
      console.log("class", cls.getName());
      if (cls.isExported()) {
        const summary = await this.summarizeNode(cls);
        if (summary) summaries.push(summary);
      } else {
        console.log("not exported");
      }
    }

    console.log("CLASSES", summaries);

    return summaries;
  }

  public async readFileSummary(
    filePath: string
  ): Promise<FunctionOrClassSummary[]> {
    const ext = path.extname(filePath);
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      console.log("file summary skipped", filePath, ext);
      return [];
    }

    console.log("read file summary for", filePath);
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(filePath);

    const functionSummaries = await this.getFunctionSummaries(sourceFile);
    const classSummaries = await this.getFunctionSummaries(sourceFile);

    return [...functionSummaries, ...classSummaries];
  }
}

export { FileSummarizer };

import path from "node:path";
import {
  Project,
  SyntaxKind,
  ClassDeclaration,
  FunctionDeclaration,
  // MethodDeclaration,
  // VariableStatement,
  SourceFile,
  VariableDeclaration,
  MethodDeclaration,
} from "ts-morph";
import { parse } from "comment-parser";
import { Summarizer } from "./summarizer";

// Constants
export const SUPPORTED_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx"];

export interface NodeSummary {
  name: string;
  text: string;
  methods?: NodeSummary[];
}

export type JsdocNode = ClassDeclaration | FunctionDeclaration;

export type SummarizableNode =
  | ClassDeclaration
  | FunctionDeclaration
  | VariableDeclaration
  | MethodDeclaration;

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

  mayHaveJsDoc(node: SummarizableNode) {
    return (
      node instanceof FunctionDeclaration || node instanceof ClassDeclaration
    );
  }

  private getJsDoc(node: SummarizableNode) {
    if (!this.mayHaveJsDoc(node)) return "";
    const jsDocs = node
      .getJsDocs()
      .map((doc) => doc.getDescription())
      .join("\n");
    return this.extractJsDocDescription(jsDocs);
  }

  private async summarizeNode(
    sourceFile: SourceFile,
    node: SummarizableNode
  ): Promise<NodeSummary | undefined> {
    const name = node.getName();
    const docSummary = this.getJsDoc(node);
    const code = node.getText();
    const aiDocSummary = docSummary;
    const aiNodeSummary = await this.summarizer.summarize(
      code,
      "Write a brief single sentence documentation summary of the purpose of the following:"
    );

    if (!name || (!aiDocSummary && !aiNodeSummary)) {
      return;
    }
    let summary = aiNodeSummary;
    const combined = aiDocSummary
      ? [aiDocSummary, aiNodeSummary].join("\n")
      : undefined;
    summary = combined
      ? (await this.summarizer.summarize(combined)) + ""
      : summary + "";

    const entry: NodeSummary = { name, text: summary };

    if (node.getKind() === SyntaxKind.ClassDeclaration) {
      const methods = (node as ClassDeclaration)
        .getMethods()
        .filter((method) => method.getScope() === "public")
        .map(async (methodNode) => {
          const name = methodNode.getName();
          const aiDocSummary = this.getJsDoc(methodNode);
          const code = methodNode.getText();
          const aiNodeSummary = await this.summarizer.summarize(
            code,
            "Write a brief single sentence documentation summary of the purpose of the following:"
          );

          if (!name || (!aiDocSummary && !aiNodeSummary)) {
            return;
          }
          let summary = aiNodeSummary;
          const combined = aiDocSummary
            ? [aiDocSummary, aiNodeSummary].join("\n")
            : undefined;
          summary = combined
            ? (await this.summarizer.summarize(combined)) + ""
            : summary + "";

          return { name, text: summary };
        });

      entry.methods = (await Promise.all(methods)).filter(
        Boolean
      ) as NodeSummary[];
    }

    return entry;
  }

  async getFunctionSummaries(sourceFile: SourceFile) {
    const summaries: NodeSummary[] = [];

    // Extract exported functions
    for (const func of sourceFile.getFunctions()) {
      if (func.isExported()) {
        const summary = await this.summarizeNode(sourceFile, func);
        if (summary) summaries.push(summary);
      }
    }
    return summaries;
  }

  async getClassSummaries(sourceFile: SourceFile) {
    const summaries: NodeSummary[] = [];

    // Extract exported classes
    for (const cls of sourceFile.getClasses()) {
      if (cls.isExported()) {
        const summary = await this.summarizeNode(sourceFile, cls);
        if (summary) summaries.push(summary);
      }
    }
    return summaries;
  }

  async getVariableDeclarations(sourceFile: SourceFile) {
    const summaries: NodeSummary[] = [];

    // Extract exported classes
    for (const variable of sourceFile.getVariableDeclarations()) {
      if (variable.isExported()) {
        const summary = await this.summarizeNode(sourceFile, variable);
        if (summary) summaries.push(summary);
      }
    }
    return summaries;
  }

  public async readFileSummary(filePath: string): Promise<NodeSummary[]> {
    const ext = path.extname(filePath);
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return [];
    }
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(filePath);

    const functionSummaries = await this.getFunctionSummaries(sourceFile);
    const classSummaries = await this.getClassSummaries(sourceFile);

    return [...functionSummaries, ...classSummaries];
  }
}

export { FileSummarizer };

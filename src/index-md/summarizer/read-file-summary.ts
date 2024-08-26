import path from "node:path";
import {
  Project,
  SyntaxKind,
  ClassDeclaration,
  FunctionDeclaration,
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

export type JsDocNode = ClassDeclaration | FunctionDeclaration;

export type ExportableNode =
  | ClassDeclaration
  | FunctionDeclaration
  | VariableDeclaration;

export type SummarizableNode = ExportableNode | MethodDeclaration;

class FileSummarizer {
  private summarizer: Summarizer;

  constructor(summarizer: Summarizer) {
    this.summarizer = summarizer;
  }

  private getSourceFile(filePath: string): SourceFile {
    const project = new Project();
    return project.addSourceFileAtPath(filePath);
  }

  private validateExt(filePath: string): boolean {
    const ext = path.extname(filePath);
    return SUPPORTED_EXTENSIONS.includes(ext);
  }

  private isClass(node: SummarizableNode): boolean {
    return node.getKind() === SyntaxKind.ClassDeclaration;
  }

  private combineNodeSummary(
    docSummary: string,
    aiNodeSummary: string
  ): string {
    return docSummary ? [docSummary, aiNodeSummary].join("\n") : aiNodeSummary;
  }

  private extractJsDocDescription(jsDocText: string): string {
    const parsed = parse(jsDocText);
    return parsed.length > 0 ? parsed[0].description || "" : "";
  }

  private mayHaveJsDoc(node: SummarizableNode): boolean {
    return (
      node instanceof FunctionDeclaration || node instanceof ClassDeclaration
    );
  }

  private getJsDoc(node: SummarizableNode): string {
    if (!this.mayHaveJsDoc(node)) return "";
    const jsDocs = (node as JsDocNode)
      .getJsDocs()
      .map((doc) => doc.getDescription())
      .join("\n");
    return this.extractJsDocDescription(jsDocs);
  }

  private async summarizeNode(
    node: SummarizableNode
  ): Promise<NodeSummary | undefined> {
    const name = node.getName();
    const docSummary = this.getJsDoc(node);
    const code = node.getText();
    const aiNodeSummary = await this.summarizer.summarize(
      code,
      "Write a brief single sentence documentation summary of the purpose of the following:"
    );

    if (!name || (!docSummary && !aiNodeSummary)) return undefined;

    const summary = this.combineNodeSummary(docSummary, aiNodeSummary);
    const entry: NodeSummary = { name, text: summary };

    if (this.isClass(node)) {
      const methods = await this.getMethodSummaries(node as ClassDeclaration);
      if (methods.length) entry.methods = methods;
    }

    return entry;
  }

  private isPublic(methodNode: MethodDeclaration) {
    return methodNode.getScope() === "public";
  }

  private async getMethodSummaries(
    classNode: ClassDeclaration
  ): Promise<NodeSummary[]> {
    const methods: NodeSummary[] = [];
    for (const methodNode of classNode.getMethods()) {
      if (!this.isPublic(methodNode)) continue;
      const summary = await this.summarizeNode(methodNode);
      if (summary) methods.push(summary);
    }
    return methods;
  }

  private async getSummariesByType(
    sourceFile: SourceFile,
    getTypeNodes: () => ExportableNode[]
  ): Promise<NodeSummary[]> {
    const summaries: NodeSummary[] = [];
    for (const node of getTypeNodes()) {
      if (node.isExported()) {
        const summary = await this.summarizeNode(node);
        summary && summaries.push(summary);
      }
    }
    return summaries;
  }

  public async readFileSummary(filePath: string): Promise<NodeSummary[]> {
    if (!this.validateExt(filePath)) return [];

    const sourceFile = this.getSourceFile(filePath);
    const functionSummaries = await this.getSummariesByType(
      sourceFile,
      sourceFile.getFunctions.bind(sourceFile)
    );
    const classSummaries = await this.getSummariesByType(
      sourceFile,
      sourceFile.getClasses.bind(sourceFile)
    );
    const variableSummaries = await this.getSummariesByType(
      sourceFile,
      sourceFile.getVariableDeclarations.bind(sourceFile)
    );

    return [...functionSummaries, ...classSummaries, ...variableSummaries];
  }
}

export { FileSummarizer };

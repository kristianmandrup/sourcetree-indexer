import { ClassDeclaration, SyntaxKind } from "ts-morph";
import { JsDocExtractor } from "./jsdoc-extractor";
import { Summarizer } from "../../summarizer";
import { SummarizableNode, NodeSummary, NodeKind } from "./types";
import { appContext } from "../../app-context";
import { CodeAnalyzer } from "../code-analyzer";
import { CodeSuggester } from "../code-suggester";

export class NodeSummarizer {
  public summarizer: Summarizer;
  private jsDocExtractor: JsDocExtractor;

  constructor(summarizer: Summarizer, jsDocExtractor?: JsDocExtractor) {
    this.summarizer = summarizer;
    this.jsDocExtractor = jsDocExtractor || new JsDocExtractor();
  }

  private combineNodeSummary(
    docSummary: string,
    aiNodeSummary: string
  ): string {
    return docSummary ? [docSummary, aiNodeSummary].join("\n") : aiNodeSummary;
  }

  getKindName(node: SummarizableNode): NodeKind {
    switch (node.getKind()) {
      case SyntaxKind.ClassDeclaration:
        return "class";
      case SyntaxKind.FunctionDeclaration:
        return "function";
      case SyntaxKind.InterfaceDeclaration:
        return "interface";
      case SyntaxKind.TypeAliasDeclaration:
        return "type";
      case SyntaxKind.MethodDeclaration:
        return "method";
      default:
        throw new Error(`Unsupported node kind: ${node.getKindName()}`);
    }
  }

  async summarize(text: string, propmt?: string): Promise<string> {
    return await this.summarizer.summarize(text, propmt);
  }

  async summarizeNode(
    node: SummarizableNode
  ): Promise<NodeSummary | undefined> {
    const name = node.getName();
    const docSummary = this.jsDocExtractor.getJsDoc(node);
    const code = node.getText();
    const aiNodeSummary = await this.summarize(
      code,
      "Write a brief single sentence documentation summary of the purpose of the following:"
    );

    if (!name || (!docSummary && !aiNodeSummary)) return undefined;

    // "class" | "function" | "interface" | "type";
    const kind = this.getKindName(node);
    const summary = this.combineNodeSummary(docSummary, aiNodeSummary);

    const entry: NodeSummary = { name, text: summary, kind };

    await this.processClassNode(node, entry);

    if (kind === "class" || kind === "function") {
      await this.analyze(code, entry);
      await this.makeSuggestionsFor(code, entry);
    }

    return entry;
  }

  protected async analyze(code: string, entry: NodeSummary) {
    new CodeAnalyzer().analyze(code, entry);
  }

  protected async makeSuggestionsFor(code: string, entry: NodeSummary) {
    new CodeSuggester().suggest(code, entry);
  }

  protected async processClassNode(node: SummarizableNode, entry: NodeSummary) {
    if (!this.isClassNode(node)) return;
    const methods = await this.getMethodSummaries(node as ClassDeclaration);
    if (methods.length) entry.methods = methods;
  }

  private isClassNode(node: SummarizableNode) {
    return node.getKind() === SyntaxKind.ClassDeclaration;
  }

  private async getMethodSummaries(
    classNode: ClassDeclaration
  ): Promise<NodeSummary[]> {
    const methods: NodeSummary[] = [];
    for (const methodNode of classNode.getMethods()) {
      if (methodNode.getScope() === "public") {
        const summary = await this.summarizeNode(methodNode);
        if (summary) methods.push(summary);
      }
    }
    return methods;
  }
}

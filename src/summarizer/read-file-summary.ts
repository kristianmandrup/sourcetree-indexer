import path from "path";
import { Node, Project, SyntaxKind } from "ts-morph";
import { parse } from "comment-parser";
import { Summarizer } from "./summarizer";

// Constants
export const SUPPORTED_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx"];

// Interfaces
export interface FunctionOrClassSummary {
  name: string;
  summary: string;
  methods?: FunctionOrClassSummary[];
}

const extractJsDocDescription = (jsDocText: string): string => {
  const parsed = parse(jsDocText);
  return parsed.length > 0
    ? parsed[0].description || "No summary available."
    : "No summary available.";
};

// Utility function to determine if a node is a function or class declaration
const isFunctionOrClassDeclaration = (node: Node): boolean =>
  node.getKind() === SyntaxKind.FunctionDeclaration ||
  node.getKind() === SyntaxKind.ClassDeclaration;

// Function to generate summaries for functions and classes
const summarizeNode = async (
  node: Node,
  summarizer: Summarizer
): Promise<FunctionOrClassSummary | null> => {
  const name = node.getSymbol()?.getName();
  const docSummary = extractJsDocDescription(node.getText());

  // Use AI to generate a more detailed summary
  const aiSummary = await summarizer.summarize(docSummary);

  if (!name || !aiSummary) return null;

  const entry: FunctionOrClassSummary = { name, summary: aiSummary };

  // Handle method declarations if the node is a class
  if (node.getKind() === SyntaxKind.ClassDeclaration) {
    const methods = node
      .getChildrenOfKind(SyntaxKind.MethodDeclaration)
      .map(async (methodNode) => {
        const methodName = methodNode.getSymbol()?.getName();
        const methodDocSummary = extractJsDocDescription(methodNode.getText());
        const methodAiSummary = await summarizer.summarize(methodDocSummary);
        return methodName && methodAiSummary
          ? { name: methodName, summary: methodAiSummary }
          : null;
      });

    // Wait for all method summaries to resolve
    entry.methods = (await Promise.all(methods)).filter(
      Boolean
    ) as FunctionOrClassSummary[];
  }

  return entry;
};

// Function to summarize a file's content
export const readFileSummary = async (
  filePath: string,
  summarizer: Summarizer
): Promise<FunctionOrClassSummary[]> => {
  const ext = path.extname(filePath);
  if (!SUPPORTED_EXTENSIONS.includes(ext)) return [];

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  const summaries: FunctionOrClassSummary[] = [];

  for (const node of sourceFile.getChildren()) {
    if (isFunctionOrClassDeclaration(node)) {
      const summary = await summarizeNode(node, summarizer);
      if (summary) summaries.push(summary);
    }
  }

  return summaries;
};

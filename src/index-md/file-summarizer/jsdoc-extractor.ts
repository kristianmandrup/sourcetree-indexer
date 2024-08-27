import { JSDoc, SyntaxKind } from "ts-morph";
import { parse } from "comment-parser";
import { JsDocNode, SummarizableNode } from "./types";

export class JsDocExtractor {
  mayHaveJsDoc(node: SummarizableNode): boolean {
    return (
      node.getKind() === SyntaxKind.FunctionDeclaration ||
      node.getKind() === SyntaxKind.ClassDeclaration
    );
  }

  getJsDoc(node: SummarizableNode): string {
    if (!this.mayHaveJsDoc(node)) return "";
    const jsDocs = (node as JsDocNode)
      .getJsDocs()
      .map((doc: JSDoc) => doc.getDescription())
      .join("\n");
    return this.extractJsDocDescription(jsDocs);
  }

  extractJsDocDescription(jsDocText: string): string {
    const parsed = parse(jsDocText);
    return parsed.length > 0 ? parsed[0].description || "" : "";
  }
}

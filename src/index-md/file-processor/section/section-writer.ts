import path from "path";
import { NodeSummary } from "../../file-summarizer";
import { Anchor } from "./anchor";
import { appContext } from "../../app-context";

export class SectionWriter {
  anchor: Anchor;
  constructor(private readonly fileName: string) {
    this.anchor = new Anchor(fileName);
  }

  generateAnchor(title: string) {
    return this.anchor.generate(title);
  }

  h2(type: string, title: string) {
    const link = this.generateAnchor(title);
    return `### ${type}: ${link}`;
  }

  get useAnchor() {
    return appContext.runtimeOpts.toc;
  }

  h3(type: string, title: string) {
    const header = this.useAnchor ? this.generateAnchor(title) : title;
    return `#### ${type}: ${header}`;
  }

  h(count: number): string {
    return "#".repeat(count);
  }

  complexitySection(summary: NodeSummary, lv = 4) {
    if (!summary.complexity) return;
    const { complexity } = summary;
    const title = `${this.h(lv)} Code Complexity`;
    const text = `Score: ${complexity.score} (${complexity.label})`;
    return [title, text].join("\n\n");
  }

  suggestionsSection(summary: NodeSummary, lv = 4) {
    if (!summary.suggestions) return;
    const { suggestions } = summary;
    const title = `${this.h(lv)} Code improvement suggestions`;
    const text = suggestions;
    return [title, text].join("\n\n");
  }

  combineSection(title: string, summary: NodeSummary) {
    const sections = [
      title,
      summary.text,
      this.complexitySection(summary),
      this.suggestionsSection(summary),
    ]
      .filter((sec) => sec)
      .join("\n\n");
    return sections;
  }

  addSummarySection(type: string, summary: NodeSummary) {
    const title = this.h2(type, summary.name);
    return this.combineSection(title, summary);
  }

  addSummarySubSection(type: string, summary: NodeSummary) {
    const title = this.h3(type, summary.name);
    return this.combineSection(title, summary);
  }
}

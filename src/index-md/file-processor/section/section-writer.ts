import path from "path";
import { NodeSummary } from "../../file-summarizer";
import { Anchor } from "./anchor";
import { appContext } from "../../app-context";
import { SectionSummary } from "../../directory-processor/types";

export class SectionWriter {
  anchor: Anchor;
  slug?: string;
  constructor(private readonly fileName: string) {
    this.anchor = new Anchor(fileName);
  }

  generateAnchor(title: string) {
    const anchor = this.anchor.generate(title);
    this.slug = anchor.slug;
    return anchor.link;
  }

  get useAnchor() {
    return appContext.runtimeOpts.toc;
  }

  h2(type: string, title: string) {
    return this.hn(type, title, 2);
  }

  h3(type: string, title: string) {
    return this.hn(type, title, 3);
  }

  hn(type: string, title: string, lv: number) {
    const header = this.useAnchor ? this.generateAnchor(title) : title;
    const hashes = this.h(lv);
    return `${hashes} ${type}: ${header}`;
  }

  h(count: number): string {
    return "#".repeat(count);
  }

  complexitySection(summary: NodeSummary | SectionSummary, lv = 4) {
    if (!summary.complexity) return;
    const { complexity } = summary;
    const title = `${this.h(lv)} Code Complexity`;
    const text = `Score: ${complexity.score} (${complexity.label})`;
    return [title, text].join("\n\n");
  }

  suggestionsSection(summary: NodeSummary | SectionSummary, lv = 4) {
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
    summary.slug = this.slug;
    summary.lv = 2;
    return this.combineSection(title, summary);
  }

  addSummarySubSection(type: string, summary: NodeSummary) {
    const title = this.h3(type, summary.name);
    summary.slug = this.slug;
    summary.lv = 3;
    return this.combineSection(title, summary);
  }
}

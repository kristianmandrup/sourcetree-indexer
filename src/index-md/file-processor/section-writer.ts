import path from "path";
import { NodeSummary } from "../file-summarizer";

export class SectionWriter {
  constructor(private readonly fileName: string) {}

  sluggify(text: string): string {
    return text
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[\s\W-]+/g, "-") // Replace spaces and non-alphanumeric characters with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
  }

  generateAnchor(name: string) {
    const fileName = path.basename(this.fileName, path.extname(this.fileName));
    const anchorName = [fileName, name].join("-");
    const anchorLink = this.sluggify(anchorName);
    return `<a href="#${anchorLink}">${name}</a>`;
  }

  h2(type: string, title: string) {
    const link = this.generateAnchor(title);
    return `### ${type}: ${link}`;
  }

  h3(type: string, title: string) {
    const link = this.generateAnchor(title);
    return `#### ${type}: ${link}`;
  }

  addSummarySection(type: string, summary: NodeSummary) {
    return [this.h2(type, summary.name), summary.text];
  }

  addSummarySubSection(type: string, summary: NodeSummary) {
    return [this.h3(type, summary.name), summary.text];
  }
}

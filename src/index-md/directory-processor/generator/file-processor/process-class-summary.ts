import { NodeSummary } from "./file-summarizer";
import { SectionWriter } from "./section";

export class ProcessClassSummary {
  private readonly indexEntries: string[];
  private sectionWriter!: SectionWriter;

  constructor(indexEntries: string[]) {
    this.indexEntries = indexEntries;
  }

  setWriter(sectionWriter: SectionWriter) {
    this.sectionWriter = sectionWriter;
  }

  addSummarySection(type: string, summary: NodeSummary) {
    this.indexEntries.push(
      ...this.sectionWriter?.addSummarySection(type, summary)
    );
  }

  addSummarySubSection(type: string, summary: NodeSummary) {
    this.indexEntries.push(
      ...this.sectionWriter?.addSummarySubSection(type, summary)
    );
  }

  public async processClass(summary: NodeSummary): Promise<string[]> {
    this.addSummarySection("Class", summary);

    if (summary.methods) {
      await this.processMethodSummaries(summary.methods);
    }
    return this.indexEntries;
  }

  public async processMethodSummaries(methods: NodeSummary[]): Promise<void> {
    for (const method of methods) {
      if (method.kind === "method") {
        await this.processMethodSummary(method);
      }
    }
  }

  private async processMethodSummary(summary: NodeSummary): Promise<void> {
    this.addSummarySubSection("Method", summary);
  }
}

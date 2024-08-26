import { NodeSummary } from "../file-summarizer";

export class ProcessClassSummary {
  private readonly indexEntries: string[];

  constructor(indexEntries: string[]) {
    this.indexEntries = indexEntries;
  }

  public async processClass(summary: NodeSummary): Promise<void> {
    this.indexEntries.push(`### Class: ${summary.name}`);
    this.indexEntries.push(`${summary.text}`);

    if (summary.methods) {
      await this.processMethodSummaries(summary.methods);
    }
  }

  public async processMethodSummaries(methods: NodeSummary[]): Promise<void> {
    for (const method of methods) {
      if (method.kind === "method") {
        await this.processMethodSummary(method);
      }
    }
  }

  private async processMethodSummary(summary: NodeSummary): Promise<void> {
    this.indexEntries.push(`### Method: ${summary.name}`);
    this.indexEntries.push(`${summary.text}`);
  }
}

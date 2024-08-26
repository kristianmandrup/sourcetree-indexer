import { NodeSummary } from "../file-summarizer";
import { ProcessClassSummary } from "./process-class-summary";

export class NodeSummaryProcessor {
  private readonly indexEntries: string[];
  private readonly processClassSummary: ProcessClassSummary; // Ensure ProcessClassSummary is imported or defined

  constructor(indexEntries: string[]) {
    this.indexEntries = indexEntries;
    this.processClassSummary = new ProcessClassSummary(indexEntries); // Assuming ProcessClassSummary is defined
  }

  public async processSummaries(summaries: NodeSummary[]): Promise<void> {
    for (const summary of summaries) {
      const process = this.getProcessor(summary.kind);
      if (process) {
        await process(summary);
      } else {
        throw new Error(`Unknown summary kind: ${summary.kind}`);
      }
    }
  }

  private getProcessor(
    kind: NodeSummary["kind"]
  ): (summary: NodeSummary) => Promise<void> | undefined {
    const processors: Record<
      NodeSummary["kind"],
      (summary: NodeSummary) => Promise<void>
    > = {
      class: this.processClass.bind(this),
      enum: this.processEnum.bind(this),
      function: this.processFunction.bind(this),
      interface: this.processInterface.bind(this),
      type: this.processType.bind(this),
      method: this.processMethod.bind(this),
    };
    return processors[kind];
  }

  private async processClass(summary: NodeSummary): Promise<void> {
    await this.processClassSummary.processClass(summary);
  }

  private async processEnum(summary: NodeSummary): Promise<void> {
    this.indexEntries.push(`### Enum: ${summary.name}`);
    this.indexEntries.push(`${summary.text}`);
  }

  private async processFunction(summary: NodeSummary): Promise<void> {
    this.indexEntries.push(`### Function: ${summary.name}`);
    this.indexEntries.push(`${summary.text}`);
  }

  private async processInterface(summary: NodeSummary): Promise<void> {
    this.indexEntries.push(`### Interface: ${summary.name}`);
    this.indexEntries.push(`${summary.text}`);
  }

  private async processType(summary: NodeSummary): Promise<void> {
    this.indexEntries.push(`### Type: ${summary.name}`);
    this.indexEntries.push(`${summary.text}`);
  }

  private async processMethod(summary: NodeSummary): Promise<void> {
    this.indexEntries.push(`### Method: ${summary.name}`);
    this.indexEntries.push(`${summary.text}`);
  }
}

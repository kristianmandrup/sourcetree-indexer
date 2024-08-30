import { NodeSummary } from "./file-summarizer";
import { ProcessClassSummary } from "./process-class-summary";
import { SectionWriter } from "./section";

export class NodeSummaryProcessor {
  sectionWriter!: SectionWriter;
  private readonly indexEntries: string[] = [];
  private readonly processClassSummary: ProcessClassSummary; // Ensure ProcessClassSummary is imported or defined
  fileName: string = "";

  constructor() {
    this.processClassSummary = new ProcessClassSummary(this.indexEntries); // Assuming ProcessClassSummary is defined
  }

  public async processSummaries(
    fileName: string,
    summaries: NodeSummary[]
  ): Promise<string[]> {
    this.fileName = fileName;
    this.sectionWriter = new SectionWriter(fileName);
    this.processClassSummary.setWriter(this.sectionWriter);
    const sortedSummaries = this.sortSummaries(summaries);

    for (const summary of sortedSummaries) {
      const process = this.getProcessor(summary.kind);
      if (process) {
        await process(summary);
      } else {
        throw new Error(`Unknown summary kind: ${summary.kind}`);
      }
    }
    return this.indexEntries;
  }

  sortSummaries(summaries: NodeSummary[]) {
    const sortable = summaries.map((summary) => this.addSortNumber(summary));
    return summaries.sort((a, b) => (a.sortNum || 0) - (b.sortNum || 0));
  }

  kindSortMap: Record<string, number> = {
    class: 0,
    function: 1,
    enum: 2,
    interface: 3,
    type: 4,
  };

  addSortNumber(summary: NodeSummary) {
    const sortNum = this.kindSortMap[summary.kind];
    summary.sortNum = sortNum;
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

  addSummarySection(type: string, summary: NodeSummary) {
    this.indexEntries.push(
      this.sectionWriter?.addSummarySection(type, summary)
    );
  }

  addSummarySubSection(type: string, summary: NodeSummary) {
    this.indexEntries.push(
      this.sectionWriter?.addSummarySubSection(type, summary)
    );
  }

  private async processClass(summary: NodeSummary): Promise<void> {
    await this.processClassSummary.processClass(summary);
  }

  private async processEnum(summary: NodeSummary): Promise<void> {
    this.addSummarySection("Enum", summary);
  }

  private async processFunction(summary: NodeSummary): Promise<void> {
    this.addSummarySection("Function", summary);
  }

  private async processInterface(summary: NodeSummary): Promise<void> {
    this.addSummarySection("Interface", summary);
  }

  private async processType(summary: NodeSummary): Promise<void> {
    this.addSummarySection("Type", summary);
  }

  private async processMethod(summary: NodeSummary): Promise<void> {
    this.addSummarySubSection("Method", summary);
  }
}

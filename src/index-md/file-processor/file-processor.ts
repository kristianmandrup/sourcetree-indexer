import { FileSummarizer, NodeSummary } from "../file-summarizer";
import { NodeSummaryProcessor } from "./node-summary-processor";

export class FileProcessor {
  private readonly fileSummarizer: FileSummarizer;
  private readonly nodeSummaryProcessor: NodeSummaryProcessor;
  private readonly indexEntries: string[];
  private readonly indexHeader: string[] = [];
  private readonly indexFooter: string[] = [];
  private readonly indexFile: string[] = [];

  constructor(fileSummarizer: FileSummarizer, indexEntries: string[]) {
    this.fileSummarizer = fileSummarizer;
    this.nodeSummaryProcessor = new NodeSummaryProcessor(indexEntries);
    this.indexEntries = indexEntries;
  }

  get summarizer() {
    return this.fileSummarizer.summarizer;
  }

  public async processFile(fullPath: string, fileName: string): Promise<void> {
    const summaries = await this.fileSummarizer.readFileSummary(fullPath);
    await this.nodeSummaryProcessor.processSummaries(summaries);
    await this.processHeader(fileName, summaries);
    await this.processFooter(fullPath);
    // TODO: combine into indexFile
  }

  async processSummaries(summaries: NodeSummary[]) {
    return await this.nodeSummaryProcessor.processSummaries(summaries);
  }

  private async processHeader(
    fileName: string,
    summaries?: NodeSummary[]
  ): Promise<void> {
    const title = `## file : ${fileName}`;
    const fileNodeSummariesText = this.indexEntries.join("\n");
    // Generate file summary using AI or other means
    const fileSummary = await this.generateFileSummary(
      title,
      fileNodeSummariesText
    );
    const fileSummaryWithTOC = await this.generateFileTOC(
      fileNodeSummariesText
    );
    this.indexHeader.push(fileSummary);
    this.indexHeader.push(fileSummaryWithTOC);
  }

  async generateFileTOC(fileNodeSummariesText: string) {
    const fileSummary = await this.summarizer.summarize(
      fileNodeSummariesText,
      "Return a new verison of this markdown document with a markdown TOC at the top and where each section is an anchor link that is referenced in the TOC"
    );
    return fileSummary;
  }

  private async generateFileSummary(
    title: string,
    fileNodeSummariesText: string
  ): Promise<string> {
    // Implement the AI-based file summary generation here
    // This is a placeholder implementation
    const fileSummary = await this.summarizer.summarize(fileNodeSummariesText);
    return [title, fileSummary].join("\n");
  }

  private async processFooter(fullPath: string): Promise<void> {
    // Add any footer material here
    const footer = await this.generateFooter(fullPath);
    this.indexEntries.push(footer);
  }

  private async generateFooter(fullPath: string): Promise<string> {
    // Implement complexity analysis and refactoring suggestions here
    // This is a placeholder implementation
    const footer = ""; // `Footer content for ${fullPath}`; // Replace with actual analysis and suggestions
    return footer;
  }
}

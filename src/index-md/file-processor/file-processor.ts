import { FileSummarizer, NodeSummary } from "../file-summarizer";
import { NodeSummaryProcessor } from "./node-summary-processor";

export class FileProcessor {
  private readonly fileSummarizer: FileSummarizer;
  private readonly nodeSummaryProcessor: NodeSummaryProcessor;

  private indexEntries: string[] = [];
  private indexHeader: string[] = [];
  private indexFooter: string[] = [];
  private fileName: string = "";

  constructor(fileSummarizer: FileSummarizer) {
    this.fileSummarizer = fileSummarizer;
    this.nodeSummaryProcessor = new NodeSummaryProcessor();
  }

  get summarizer() {
    return this.fileSummarizer.summarizer;
  }

  public async processFile(
    fullPath: string,
    fileName: string
  ): Promise<string> {
    console.log("processing", fileName);
    this.fileName = fileName;
    const summaries = await this.readFileSummaries(fullPath);
    this.indexEntries = await this.processSummaries(summaries);
    await this.processHeader();
    await this.processFooter(fullPath);
    // combine into full file text
    return this.createFullFileText();
  }

  async readFileSummaries(fullPath: string) {
    return await this.fileSummarizer.readFileSummary(fullPath);
  }

  get headerText() {
    return this.indexHeader.join("\n");
  }

  get bodyText() {
    return this.indexEntries.join("\n\n");
  }

  get footerText() {
    return this.indexFooter.join("\n");
  }

  createFullFileText() {
    return [this.headerText, this.bodyText, this.footerText].join("\n");
  }

  async processSummaries(summaries: NodeSummary[]) {
    return await this.nodeSummaryProcessor.processSummaries(
      this.fileName,
      summaries
    );
  }

  get entriesText() {
    return this.indexEntries.join("\n");
  }

  private async processHeader(): Promise<void> {
    await this.addFileSummary();
    await this.addTOC();
  }

  async addFileSummary() {
    const fileSummary = await this.generateFileSummary(
      this.fileName,
      this.entriesText
    );
    this.indexHeader.push(fileSummary);
  }

  async addTOC() {
    if (this.indexEntries.length > 10) {
      const fileSummaryWithTOC = await this.generateFileTOC(this.entriesText);
      this.indexHeader.unshift(fileSummaryWithTOC);
    }
  }

  async generateFileTOC(fileNodeSummariesText: string) {
    const fileSummary = await this.summarizer.summarize(
      fileNodeSummariesText,
      "Return a new version of this document with a Table of Contents (TOC) at the top which links to each header section"
    );
    return fileSummary;
  }

  private async generateFileSummary(
    fileName: string,
    fileText: string
  ): Promise<string> {
    const title = `## file : ${fileName}`;
    const fileSummary = await this.summarizer.summarize(
      fileText,
      "Summarize the following in a single paragraph"
    );
    return [title, fileText].join("\n\n");
  }

  private async processFooter(fullPath: string): Promise<void> {
    // Add any footer material here
    const footer = await this.generateFooter(fullPath);
    this.indexFooter.push(footer);
  }

  private async generateFooter(fullPath: string): Promise<string> {
    // Implement complexity analysis and refactoring suggestions here
    // This is a placeholder implementation
    const footer = ""; // `Footer content for ${fullPath}`; // Replace with actual analysis and suggestions
    return footer;
  }
}

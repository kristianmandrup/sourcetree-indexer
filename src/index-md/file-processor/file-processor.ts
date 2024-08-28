import moment from "moment";
import { appContext } from "../app-context";
import {
  CodeAnalyzer,
  CodeComplexity,
  CodeSuggester,
  FileSummarizer,
  NodeSummary,
} from "../file-summarizer";
import { NodeSummaryProcessor } from "./node-summary-processor";
import { SectionWriter } from "./section";
import { FileSummary } from "../directory-processor/types";

export class FileProcessor {
  private readonly fileSummarizer: FileSummarizer;
  private readonly nodeSummaryProcessor: NodeSummaryProcessor;

  private indexEntries: string[] = [];
  private indexHeader: string[] = [];
  private indexFooter: string[] = [];
  private fileName: string = "";
  private _body = "";
  private timestamp?: string;

  constructor(fileSummarizer: FileSummarizer) {
    this.fileSummarizer = fileSummarizer;
    this.nodeSummaryProcessor = new NodeSummaryProcessor();
  }

  get summarizer() {
    return this.fileSummarizer.summarizer;
  }

  createTimeStamp() {
    return moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  }

  public async processFile(
    fullPath: string,
    fileName: string
  ): Promise<FileSummary> {
    console.log("processing", fileName);
    const timestamp = this.createTimeStamp();
    this.fileName = fileName;
    const summaries = await this.readFileSummaries(fullPath);
    const summaryTexts = await this.processSummaries(summaries);
    this.indexEntries = summaryTexts;
    await this.processHeader();
    await this.processFooter();
    // combine into full file text
    const fullFileText = this.createFullFileText();
    return {
      name: fileName,
      text: fullFileText,
      timestamp,
      nodes: summaries,
    };
  }

  async readFileSummaries(fullPath: string) {
    return await this.fileSummarizer.readFileSummary(fullPath);
  }

  get headerText() {
    return this.indexHeader.join("\n");
  }

  get bodyText() {
    return (this._body = this._body || this.indexEntries.join("\n\n"));
  }

  get footerText() {
    return this.indexFooter.join("\n");
  }

  get frontMatter() {
    return ``;
  }

  createFullFileText() {
    return [this.headerText, this.bodyText, this.footerText].join("\n\n");
  }

  async processSummaries(summaries: NodeSummary[]) {
    return await this.nodeSummaryProcessor.processSummaries(
      this.fileName,
      summaries
    );
  }

  private async processHeader(): Promise<void> {
    await this.addFileSummary();
    await this.addTOC();
  }

  async addFileSummary() {
    const fileSummary = await this.generateFileSummary(
      this.fileName,
      this.bodyText
    );
    this.indexHeader.push(fileSummary);
  }

  async addTOC() {
    if (!appContext.runtimeOpts.toc) return;
    if (this.indexEntries.length < 10) return;
    const tocSection = await this.generateFileTOC(this.bodyText);
    this.indexHeader.unshift(tocSection);
  }

  async generateFileTOC(fileNodeSummariesText: string) {
    const tocSection = await this.summarizer.summarize(
      fileNodeSummariesText,
      "Generate a Table of Contents with bulletpoint links to each section of the following"
    );
    return tocSection;
  }

  private async generateFileSummary(
    fileName: string,
    fileText: string
  ): Promise<string> {
    // TODO: use section writer
    const title = `## File : ${fileName}`;
    const fileSummary = await this.summarizer.summarize(
      fileText,
      "Summarize the following in a single paragraph"
    );
    return [title, fileSummary].join("\n\n");
  }

  private async processFooter(): Promise<void> {
    // Add any footer material here
    const footer = await this.generateFooter();
    if (!footer) return;
    this.indexFooter.push(footer);
  }

  private async generateFooter(): Promise<string | undefined> {
    // TODO: use section writer?
    const title = `### Footer`;

    const result = await this.fileComplexitySection(this.bodyText);
    if (!result) return;
    const { complexity, section } = result;
    if (complexity && complexity.score < 3) {
      return section + "\n";
    }
    const suggestionsSection = await this.fileSuggestionsSection(this.bodyText);
    const sections = [title, section, suggestionsSection].filter((sec) => sec);
    return sections.join("\n\n");
  }

  private async fileComplexitySection(
    text: string
  ): Promise<{ section?: string; complexity?: CodeComplexity } | undefined> {
    if (!appContext.runtimeOpts.analyze) {
      // console.log("skip file analysis", appContext.runtimeOpts);
      return;
    }
    const { fileName } = this;
    const entry: NodeSummary = {
      name: fileName,
      text,
      kind: "file",
    };
    const complexity = await new CodeAnalyzer().analyze(text, entry);
    const section = new SectionWriter(fileName).complexitySection(entry);
    // console.log("File complexity:", section);
    return { section, complexity };
  }

  private async fileSuggestionsSection(
    text: string
  ): Promise<string | undefined> {
    if (!appContext.runtimeOpts.suggest) {
      // console.log("skip file suggestions", appContext.runtimeOpts);
      return;
    }
    const { fileName } = this;
    const entry: NodeSummary = {
      name: fileName,
      text,
      kind: "file",
    };
    const suggestions = await new CodeSuggester().suggest(text, entry);
    const section = new SectionWriter(fileName).suggestionsSection(entry);
    return section;
  }
}

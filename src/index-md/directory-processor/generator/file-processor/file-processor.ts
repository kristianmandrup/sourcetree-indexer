import moment from "moment";
import { BaseSummary, FileSummary, SectionSummary } from "../";
import { NodeSummaryProcessor } from "./node-summary-processor";
import { SectionWriter } from "./section";
import { generateContext } from "../context";
import {
  FileSummarizer,
  NodeSummary,
  CodeComplexity,
  CodeAnalyzer,
  CodeSuggester,
} from "./file-summarizer";
import { FileSystem, IFileSystem } from "../../file-system";

export class FileProcessor {
  private readonly fileSummarizer: FileSummarizer;
  private readonly nodeSummaryProcessor: NodeSummaryProcessor;
  fileSystem: IFileSystem = new FileSystem();
  private indexEntries: string[] = [];
  private indexHeader: string[] = [];
  private indexFooter: string[] = [];
  private fileName: string = "";
  private _body = "";
  summaries: NodeSummary[] = [];
  footerSummaries: SectionSummary[] = [];
  fileSummary?: string;
  tags: string[] = [];

  constructor(fileSystem?: IFileSystem) {
    this.nodeSummaryProcessor = new NodeSummaryProcessor();
    this.fileSystem = fileSystem || this.fileSystem;
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
    this.summaries = summaries;
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
      tags: this.tags,
      type: "file",
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
    await this.addTags();
    await this.addTOC();
  }

  // TODO
  async addTags() {
    const tags = await this.suggestTags();
    this.tags = tags;
  }

  async suggestTags() {
    const summariesText = this.summaries.map((sum) => sum.text).join("\n\n");
    const tags = await this.summarizer.summarize(
      summariesText,
      `Based on the following, return ONLY a comma separated list of 1-4 tags. The tags should center around concepts or domains the code can help with. Do not return any other text in your response.`
    );
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => !/typescript/i.test(tag));
    console.log({ tagList });
    return tagList;
  }

  async addFileSummary() {
    const fileSummary = await this.generateFileSummary(
      this.fileName,
      this.bodyText
    );
    this.fileSummary = fileSummary;
    this.indexHeader.push(fileSummary);
  }

  // TODO: move to TOC builder
  async addTOC() {
    if (!generateContext.runtimeOpts.toc) return;
    if (this.indexEntries.length < 10) return;
    const tocSection = await this.generateFileTOC();
    this.indexHeader.unshift(tocSection);
  }

  tocEntry(summary: BaseSummary) {
    const indent = " ".repeat(summary.lv ?? 2);
    return `${indent}- [${summary.name}](#${summary.slug})`;
  }

  async generateFileTOC() {
    const tocEntries = this.summaries.map((sum) => this.tocEntry(sum));
    return tocEntries.join("\n");
  }

  private async generateFileSummary(
    fileName: string,
    fileText: string
  ): Promise<string> {
    const title = new SectionWriter(fileName).hn("File", fileName, 2);
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
    const title = new SectionWriter(this.fileName).hn("Footer", "analysis", 3);

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
    if (!generateContext.runtimeOpts.analyze) {
      // console.log("skip file analysis", appContext.runtimeOpts);
      return;
    }
    const { fileName } = this;
    const entry: SectionSummary = {
      name: fileName,
      text,
      type: "section",
    };
    const complexity = await new CodeAnalyzer().analyze(text, entry);
    const section = new SectionWriter(fileName).complexitySection(entry);
    this.footerSummaries.push(entry);
    return { section, complexity };
  }

  private async fileSuggestionsSection(
    text: string
  ): Promise<string | undefined> {
    if (!generateContext.runtimeOpts.suggest) {
      // console.log("skip file suggestions", appContext.runtimeOpts);
      return;
    }
    const { fileName } = this;
    const entry: SectionSummary = {
      name: fileName,
      text,
      type: "section",
    };
    await new CodeSuggester().suggest(text, entry);
    this.footerSummaries.push(entry);
    const section = new SectionWriter(fileName).suggestionsSection(entry);
    return section;
  }
}

import moment from "moment";
import fs from "fs-extra";
import path from "path";
import frontmatter from "gray-matter";
import { BaseDirectoryProcessor } from "../base-dir-processor";
import { generateContext } from "./context";
import { FileProcessor, SectionWriter } from "./file-processor";
import {
  SUPPORTED_EXTENSIONS,
  CodeAnalyzer,
  CodeSuggester,
} from "./file-processor/file-summarizer";
import { IndexGenerator } from "./index-generator";
import { jsonToFrontmatterString } from "./json-to-frontmatter";
import {
  FileOrDirSummary,
  DirectorySummary,
  SummaryType,
  SectionSummary,
  FileSummary,
} from "./types";

export class DirectoryProcessor extends BaseDirectoryProcessor {
  private readonly indexEntries: string[] = [];
  private _fileContent: string = "";
  fileSummaries: FileOrDirSummary[] = [];
  metaData: Record<string, any> = {};
  frontmatterTimestamp?: Date;

  constructor() {
    super();
  }

  get fileProcessor(): FileProcessor {
    return new FileProcessor(this.fileSystem);
  }

  public async processRootDirectory(dirPath: string): Promise<void> {
    this.indexEntries.push(`## Folder : ${dirPath}`);

    await this.processDirectory(dirPath, 0);

    this.writeIndexFileAt(dirPath);
  }

  processSubDirectory(
    dirPath: string,
    lv: number
  ): Promise<DirectorySummary | undefined> {
    return new DirectoryProcessor().processDirectory(dirPath, lv);
  }

  createTimeStamp() {
    return moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
  }

  addMetaData(label: string, value: any) {
    this.metaData[label] = value;
  }

  readFrontMatter(dirPath: string) {
    try {
      const fileName = this.indexMdFileNameFor(dirPath);
      const content = this.readFileSync(fileName);
      const matter = frontmatter(content);
      return matter.data;
    } catch (err: any) {
      console.error(err.message);
    }
  }

  wasFileModifiedAfterTimestamp(
    frontmatterTimestamp?: Date,
    mostRecentlyChangedTimestamp?: Date
  ) {
    if (!frontmatterTimestamp || !mostRecentlyChangedTimestamp) return false;
    return mostRecentlyChangedTimestamp > frontmatterTimestamp;
  }

  addFolderSection(file: string) {
    const title = new SectionWriter(file).hn("Folder", file, 2);
    this.indexEntries.push(title);
  }

  public async processDirectory(
    dirPath: string,
    lv: number
  ): Promise<DirectorySummary | undefined> {
    console.log("processing", dirPath);
    const metadata = this.readFrontMatter(dirPath);
    const mostRecentlyChanged = this.getMostRecentFileChangeDate(dirPath);
    const frontmatterTimestamp = new Date(metadata?.timestamp ?? 0);
    this.frontmatterTimestamp = frontmatterTimestamp;
    const force = generateContext.runtimeOpts.force;
    if (
      !force &&
      this.wasFileModifiedAfterTimestamp(
        frontmatterTimestamp,
        mostRecentlyChanged
      )
    ) {
      console.log("skip folder, since not modified since last run");
      return;
    }
    const timestamp = this.createTimeStamp();
    this.addMetaData("timestamp", timestamp);
    const files = await this.getDirectoryFiles(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (this.isDirectory(fullPath)) {
        this.addFolderSection(file);
        // Recursively process subdirectory
        // Creates a new instance of Process directory to ensure state isolation
        const dirSummary = await this.processSubDirectory(fullPath, lv++);
        dirSummary && this.fileSummaries.push(dirSummary);
        // uses Index file in subdir to make summary of the subdir
        await this.appendSubIndex(fullPath);
      } else if (this.isSourceFile(file)) {
        const mostRecentlyChanged = this.getMostRecentFileChangeDate(file);
        if (
          !force &&
          this.wasFileModifiedAfterTimestamp(
            frontmatterTimestamp,
            mostRecentlyChanged
          )
        ) {
          console.log("skip file, since not modified since last run");
          return;
        }
        const fileSummary = await this.processFile(fullPath, file);
        this.fileSummaries.push(fileSummary);
        this.indexEntries.push(fileSummary.text);
      }
    }
    // await this.appendComplexity(dirPath, this.fileContent);
    // await this.appendSuggestions(dirPath, this.fileContent);
    const tags = await this.suggestTags();
    this.addMetaData("tags", tags);
    // Write .Index.md for the current directory
    const dirSummary = {
      name: dirPath,
      text: this.fileContent,
      files: this.fileSummaries,
      tags,
      timestamp,
      type: "folder" as SummaryType,
    };

    if (lv > 0) {
      this.writeIndexFileAt(dirPath);
      this.writeIndexJsonFileAt(dirPath, dirSummary);
    }

    return dirSummary;
  }

  get fileSummaryContent() {
    return this.fileSummaries.map((sum) => sum.text).join("\n");
  }

  isSourceFile(fileName: string) {
    const fileExt = this.getFileExtension(fileName);
    return SUPPORTED_EXTENSIONS.includes(fileExt);
  }

  getFileExtension(fileName: string) {
    return path.extname(fileName);
  }

  getMostRecentFileChangeDate(fileName: string): Date | undefined {
    try {
      const stats = fs.statSync(fileName); // Get file statistics synchronously
      const { mtime, ctime } = stats; // Destructure to get mtime and ctime
      return new Date(Math.max(mtime.getTime(), ctime.getTime())); // Return the most recent date
    } catch (err) {
      console.error(`Error retrieving stats for file: ${fileName}`, err);
    }
  }

  get fileContent() {
    return (this._fileContent =
      this._fileContent || this.indexEntries.join("\n\n"));
  }

  get frontMatter() {
    return jsonToFrontmatterString(this.metaData);
  }

  // Write .Index.md for the current directory
  writeIndexFileAt(dirPath: string) {
    // where to place Index file
    const indexFilePath = path.join(dirPath, this.indexFileName);
    // console.log("write to:", indexFilePath);
    const fullContent = [this.frontMatter, this.fileContent].join("\n");
    this.writeFileSync(indexFilePath, fullContent);
  }

  writeIndexJsonFileAt(dirPath: string, dirSummary: Record<string, any>) {
    // where to place Index file
    const indexFilePath = path.join(dirPath, this.indexJsonFileName);
    this.writeFileSync(indexFilePath, JSON.stringify(dirSummary, null, 2));
  }

  writeFileSync(filePath: string, content: string) {
    fs.writeFileSync(filePath, content);
  }

  get summarizer() {
    return generateContext.summarizer;
  }

  get fileSummarizer() {
    return generateContext.fileSummarizer;
  }

  readFileSync(filePath: string) {
    return fs.readFileSync(filePath, "utf8");
  }

  async readFile(filePath: string) {
    return await fs.readFile(filePath, "utf8");
  }

  indexMdFileNameFor(dirPath: string) {
    return path.join(dirPath, this.indexFileName);
  }

  // process sub-folder Index.md file
  private async appendSubIndex(fullPath: string): Promise<void> {
    const subIndexPath = this.indexMdFileNameFor(fullPath);
    if (await this.hasFileAt(subIndexPath)) {
      const complexitySection = await this.subfolderComplexity(fullPath);
      const suggestionsSection = this.subfolderSuggestions(fullPath);
      const title = `### Footer`;
      const sections = [title, complexitySection, suggestionsSection].filter(
        (sec) => sec
      );
      this.indexEntries.join("\n\n");
    }
  }

  async suggestTags() {
    const tags = await this.summarizer?.summarize(
      this.fileSummaryContent,
      `Based on the following, return ONLY a comma separated list of 1-6 tags. The tags should center around concepts or domains the code can help with. Do not return any other text in your response.`
    );
    if (!tags) return [];
    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => !/typescript/i.test(tag));
    console.log({ tagList });
    return tagList;
  }

  private async subfolderSummary(filePath: string) {
    const content = await this.readFile(filePath);
    const aiSummary = await this.summarizer?.summarize(content);
    if (!aiSummary) return;
    this.indexEntries.push(aiSummary);
    return aiSummary;
  }

  private async subfolderComplexity(
    fullPath: string
  ): Promise<string | undefined> {
    if (!generateContext.runtimeOpts.analyze) return;
    const text = this.fileSummaries
      .map((sum) => {
        const sumText = sum.text;
        const complexityText = sum.complexity
          ? `Complexity: ${sum.complexity}`
          : undefined;
        return complexityText ? [sumText, complexityText].join("\n") : sumText;
      })
      .join("\n\n");
    const entry: SectionSummary = {
      name: fullPath,
      text,
      type: "section",
    };
    const complexity = await new CodeAnalyzer().analyze(text, entry);
    entry.complexity = complexity;
    const section = new SectionWriter(fullPath).complexitySection(entry);
    return section;
  }

  private async subfolderSuggestions(
    fullPath: string
  ): Promise<string | undefined> {
    if (!generateContext.runtimeOpts.suggest) return;
    const aiSummary = await this.subfolderSummary(fullPath);
    if (!aiSummary) return;
    const text = this.fileSummaries
      .map((sum) => {
        const sumText = sum.text;
        const tagsText = sum.tags ? `Tags: ${sum.tags}` : undefined;
        const complexityText = sum.complexity
          ? `Complexity: ${sum.complexity}`
          : undefined;
        return [sumText, tagsText, complexityText]
          .filter((text) => text)
          .join("\n\n");
      })
      .join("\n\n");

    const entry: SectionSummary = {
      name: fullPath,
      text: aiSummary,
      type: "section",
    };
    const prompt =
      "Make suggestions for how to refactor the folder structure to adhere to best design practices";
    const suggestions = await new CodeSuggester(prompt).suggest(text, entry);
    entry.suggestions = suggestions;
    const section = new SectionWriter(fullPath).suggestionsSection(entry);
    return section;
  }

  private async processFile(
    fullPath: string,
    fileName: string
  ): Promise<FileSummary> {
    return await this.fileProcessor.processFile(fullPath, fileName);
  }
}

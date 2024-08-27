import fs from "fs-extra";
import path from "path";
import {
  CodeAnalyzer,
  CodeSuggester,
  NodeSummary,
  SUPPORTED_EXTENSIONS,
} from "../file-summarizer";
import { IndexGenerator } from "../index-generator";
import { FileProcessor } from "../file-processor/file-processor";
import { SectionWriter } from "../file-processor";
import { appContext } from "../app-context";

export class DirectoryProcessor {
  private readonly indexEntries: string[] = [];
  private _fileContent: string = "";

  constructor(private readonly indexGenerator: IndexGenerator) {}

  get fileProcessor(): FileProcessor {
    return new FileProcessor(this.fileSummarizer);
  }

  get indexFileName() {
    return ".Index.md";
  }

  isDirectory(fullPath: string) {
    const stats = fs.statSync(fullPath);
    return stats.isDirectory();
  }

  getDirectoryFiles(dirPath: string) {
    return fs.readdirSync(dirPath);
  }

  public async processRootDirectory(dirPath: string): Promise<void> {
    this.indexEntries.push(`## Folder : ${dirPath}`);

    await this.processDirectory(dirPath, 0);

    this.writeIndexFileAt(dirPath);
  }

  public async processDirectory(dirPath: string, lv: number): Promise<void> {
    console.log("processing", dirPath);
    const files = this.getDirectoryFiles(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (this.isDirectory(fullPath)) {
        this.indexEntries.push(`## Folder : ${file}`);
        // TODO: should likely create a new instance of Process directory instead
        await this.processDirectory(fullPath, lv++); // Recursively process subdirectory
        // await this.appendSubIndex(fullPath);
      } else if (this.isSourceFile(file)) {
        const fileMarkdownText = await this.processFile(fullPath, file);
        this.indexEntries.push(fileMarkdownText);
      }
    }
    // await this.appendComplexity(dirPath, this.fileContent);
    // await this.appendSuggestions(dirPath, this.fileContent);

    // Write .Index.md for the current directory
    if (lv > 0) {
      this.writeIndexFileAt(dirPath);
    }
  }

  isSourceFile(fileName: string) {
    const fileExt = this.getFileExtension(fileName);
    return SUPPORTED_EXTENSIONS.includes(fileExt);
  }

  getFileExtension(fileName: string) {
    return path.extname(fileName);
  }

  get fileContent() {
    return (this._fileContent =
      this._fileContent || this.indexEntries.join("\n\n"));
  }

  // Write .Index.md for the current directory
  writeIndexFileAt(dirPath: string) {
    // where to place Index file
    const indexFilePath = path.join(dirPath, this.indexFileName);
    // console.log("write to:", indexFilePath);
    this.writeFileSync(indexFilePath, this.fileContent);
  }

  writeFileSync(filePath: string, content: string) {
    fs.writeFileSync(filePath, this.fileContent);
  }

  get summarizer() {
    return this.indexGenerator.summarizer;
  }

  get fileSummarizer() {
    return this.indexGenerator.fileSummarizer;
  }

  readFileSync(filePath: string) {
    return fs.readFileSync(filePath, "utf8");
  }

  async readFile(filePath: string) {
    return await fs.readFile(filePath, "utf8");
  }

  // process sub-folder Index.md file
  private async appendSubIndex(fullPath: string): Promise<void> {
    const subIndexPath = path.join(fullPath, this.indexFileName);
    if (fs.existsSync(subIndexPath)) {
      const aiSummary = await this.subfolderSummary(subIndexPath);
      const complexitySection = await this.subfolderComplexity(
        fullPath,
        aiSummary
      );
      const suggestionsSection = this.subfolderSuggestions(fullPath, aiSummary);
      const title = `### Footer`;
      const sections = [title, complexitySection, suggestionsSection].filter(
        (sec) => sec
      );
      this.indexEntries.join("\n\n");
    }
  }

  hasSubFolderIndexFile(filePath: string) {
    return fs.existsSync(filePath);
  }

  private async subfolderSummary(filePath: string) {
    const content = await this.readFile(filePath);
    const aiSummary = await this.summarizer.summarize(content);
    this.indexEntries.push(aiSummary);
    return aiSummary;
  }

  private async subfolderComplexity(
    fullPath: string,
    text: string
  ): Promise<string | undefined> {
    if (!appContext.runtimeOpts.analyze) return;
    const entry: NodeSummary = {
      name: fullPath,
      text,
      kind: "file",
    };
    const complexity = await new CodeAnalyzer().analyze(text, entry);
    entry.complexity = complexity;
    const section = new SectionWriter(fullPath).complexitySection(entry);
    return section;
  }

  private async subfolderSuggestions(
    fullPath: string,
    text: string
  ): Promise<string | undefined> {
    if (!appContext.runtimeOpts.suggest) return;
    const entry: NodeSummary = {
      name: fullPath,
      text,
      kind: "file",
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
  ): Promise<string> {
    return await this.fileProcessor.processFile(fullPath, fileName);
  }
}

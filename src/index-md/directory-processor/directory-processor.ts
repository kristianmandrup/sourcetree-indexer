import fs from "fs-extra";
import path from "path";
import { SourceFileProcessor, SUPPORTED_EXTENSIONS } from "../file-summarizer";
import { IndexGenerator } from "../index-generator";
import { FileProcessor } from "../file-processor/file-processor";

export class DirectoryProcessor {
  private readonly indexEntries: string[] = [];

  constructor(private readonly indexGenerator: IndexGenerator) {}

  get fileProcessor(): FileProcessor {
    return new FileProcessor(this.fileSummarizer, this.indexEntries);
  }

  get indexFileName() {
    return ".Index.md";
  }

  public async processDirectory(dirPath: string): Promise<void> {
    console.log("processing", dirPath);
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        this.indexEntries.push(`## folder : ${file}`);
        await this.processDirectory(fullPath); // Recursively process subdirectory
        await this.appendSubIndex(fullPath);
      } else if (SUPPORTED_EXTENSIONS.includes(path.extname(file))) {
        await this.processFile(fullPath, file);
      }
    }
    // where to place Index file
    const indexPath = path.join(dirPath);
    // Write .Index.md for the current directory
    this.writeIndexFile(indexPath);
  }

  get fileContent() {
    return this.indexEntries.join("\n\n");
  }

  // Write .Index.md for the current directory
  writeIndexFile(filePath: string) {
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

  // process sub-folder index file
  private async appendSubIndex(fullPath: string): Promise<void> {
    const subIndexPath = path.join(fullPath, this.indexFileName);
    if (fs.existsSync(subIndexPath)) {
      const subIndexContent = await this.readFile(subIndexPath);
      const aiSummary = await this.summarizer.summarize(subIndexContent);
      this.indexEntries.push(aiSummary);
    }
  }

  private async processFile(fullPath: string, fileName: string): Promise<void> {
    return await this.fileProcessor.processFile(fullPath, fileName);
  }
}

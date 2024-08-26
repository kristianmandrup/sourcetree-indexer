import fs from "fs-extra";
import path from "path";
import { Summarizer } from "./summarizer/summarizer";
import {
  NodeSummary,
  FileSummarizer,
  SUPPORTED_EXTENSIONS,
} from "./summarizer/read-file-summary";

export const generateIndexMd = async (
  dirPath: string,
  summarizer: Summarizer
) => {
  new IndexGenerator(summarizer).generateIndexMd(dirPath);
};

class IndexGenerator {
  private summarizer: Summarizer;
  private fileSummarizer: FileSummarizer;

  constructor(summarizer: Summarizer) {
    this.summarizer = summarizer;
    this.fileSummarizer = new FileSummarizer(summarizer);
  }

  public async generateIndexMd(dirPath: string) {
    await this.processDirectory(dirPath);
  }

  private async processDirectory(dirPath: string) {
    console.log("processing", dirPath);
    const indexEntries: string[] = [];
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        indexEntries.push(`## folder : ${file}`);
        await this.processDirectory(fullPath); // Recursively process subdirectory
        await this.appendSubIndex(fullPath, indexEntries);
      } else if (SUPPORTED_EXTENSIONS.includes(path.extname(file))) {
        await this.processFile(fullPath, indexEntries, file);
      }
    }

    const indexPath = path.join(dirPath, ".Index.md");
    fs.writeFileSync(indexPath, indexEntries.join("\n\n")); // Write .Index.md for the current directory
  }

  private async appendSubIndex(fullPath: string, indexEntries: string[]) {
    const subIndexPath = path.join(fullPath, ".Index.md");
    if (fs.existsSync(subIndexPath)) {
      const subIndexContent = fs.readFileSync(subIndexPath, "utf8");
      const aiSummary = await this.summarizer.summarize(subIndexContent);
      indexEntries.push(aiSummary);
    }
  }

  private async processFile(
    fullPath: string,
    indexEntries: string[],
    fileName: string
  ) {
    indexEntries.push(`## file : ${fileName}`);
    const summaries = await this.fileSummarizer.readFileSummary(fullPath);
    await this.generateFileSummary(summaries, indexEntries);
  }

  private async generateFileSummary(
    summaries: NodeSummary[],
    indexEntries: string[]
  ) {
    for (const summary of summaries) {
      indexEntries.push(`### ${summary.name}`);
      indexEntries.push(`${summary.text}`);

      if (summary.methods) {
        await this.addMethodSummaries(summary.methods, indexEntries);
      }
    }
  }

  private async addMethodSummaries(
    methods: { name: string; text: string }[],
    indexEntries: string[]
  ) {
    for (const method of methods) {
      indexEntries.push(`- ${method.name}: ${method.text}`);
    }
  }
}

export { IndexGenerator };

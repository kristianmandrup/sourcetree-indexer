import fs from "fs-extra";
import path from "path";
import { Summarizer } from "./summarizer/summarizer";
import {
  FunctionOrClassSummary,
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
    console.log("writing to", indexPath);
    fs.writeFileSync(indexPath, indexEntries.join("\n\n")); // Write .Index.md for the current directory
  }

  private async appendSubIndex(fullPath: string, indexEntries: string[]) {
    const subIndexPath = path.join(fullPath, ".Index.md");
    if (fs.existsSync(subIndexPath)) {
      const subIndexContent = fs.readFileSync(subIndexPath, "utf8");
      console.log("summarizing", subIndexPath);
      const aiSummary = await this.summarizer.summarize(subIndexContent);
      console.log("aiSummary:", aiSummary, "for", subIndexPath, "with:");
      console.log(subIndexContent);
      indexEntries.push(`${path.basename(fullPath)}: ${aiSummary}`);
    }
  }

  private async processFile(
    fullPath: string,
    indexEntries: string[],
    fileName: string
  ) {
    indexEntries.push(`## file : ${fileName}`);
    const summaries = await this.fileSummarizer.readFileSummary(fullPath);
    console.log({ summaries });
    await this.generateFileSummary(summaries, indexEntries);
  }

  private async generateFileSummary(
    summaries: FunctionOrClassSummary[],
    indexEntries: string[]
  ) {
    for (const summary of summaries) {
      const aiSummary = await this.summarizer.summarize(
        `${summary.name}: ${summary.summary}`
      );
      indexEntries.push(`- ${summary.name}: ${aiSummary}`);

      if (summary.methods) {
        await this.addMethodSummaries(summary.methods, indexEntries);
      }
    }
  }

  private async addMethodSummaries(
    methods: { name: string; summary: string }[],
    indexEntries: string[]
  ) {
    for (const method of methods) {
      const aiMethodSummary = await this.summarizer.summarize(
        `${method.name}: ${method.summary}`
      );
      indexEntries.push(`  - ${method.name}: ${aiMethodSummary}`);
    }
  }
}

export { IndexGenerator };

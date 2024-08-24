import fs from "fs-extra";
import { AISummarizer, Summarizer } from "./summarizer/summarizer";
import path from "path";
import {
  FunctionOrClassSummary,
  readFileSummary,
  SUPPORTED_EXTENSIONS,
} from "./summarizer/read-file-summary";

const generateIndexMd = async (dirPath: string, summarizer: Summarizer) => {
  const indexEntries: string[] = [];
  await processDirectory(dirPath, summarizer, indexEntries);
  const indexPath = path.join(dirPath, "Index.md");
  fs.writeFileSync(indexPath, indexEntries.join("\n\n"));
};

const processDirectory = async (
  dirPath: string,
  summarizer: Summarizer,
  indexEntries: string[]
) => {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      await processDirectory(fullPath, summarizer, indexEntries);
      indexEntries.push(`## folder : ${file}`);
      await appendSubIndex(fullPath, indexEntries);
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(file))) {
      await processFile(fullPath, summarizer, indexEntries, file);
    }
  }
};

const appendSubIndex = async (fullPath: string, indexEntries: string[]) => {
  const subIndexPath = path.join(fullPath, "Index.md");
  if (fs.existsSync(subIndexPath)) {
    const subIndexContent = fs.readFileSync(subIndexPath, "utf8");
    indexEntries.push(subIndexContent);
  }
};

const processFile = async (
  fullPath: string,
  summarizer: Summarizer,
  indexEntries: string[],
  fileName: string
) => {
  indexEntries.push(`## file : ${fileName}`);
  const summaries = await readFileSummary(fullPath, summarizer);
  await generateFileSummary(summaries, summarizer, indexEntries);
};

const generateFileSummary = async (
  summaries: FunctionOrClassSummary[],
  summarizer: Summarizer,
  indexEntries: string[]
) => {
  for (const summary of summaries) {
    const aiSummary = await summarizer.summarize(
      `${summary.name}: ${summary.summary}`
    );
    indexEntries.push(`- ${summary.name}: ${aiSummary}`);

    if (summary.methods) {
      for (const method of summary.methods) {
        const aiMethodSummary = await summarizer.summarize(
          `${method.name}: ${method.summary}`
        );
        indexEntries.push(`  - ${method.name}: ${aiMethodSummary}`);
      }
    }
  }
};

export { generateIndexMd };

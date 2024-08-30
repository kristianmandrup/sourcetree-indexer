import fs from "fs-extra";
import path from "path";
import { ISummarizer } from "../../summarizer/summarizer";
import {
  FileSummarizer,
  SUPPORTED_EXTENSIONS,
  NodeSummary,
  SourceFileProcessor,
  NodeSummarizer,
} from "./file-processor/file-summarizer";
import { DirectoryProcessor } from "./directory-processor";
import { generateContext } from "./context";
import { OllamaSummarizer } from "../../summarizer";

export const generateIndexMd = async (
  dirPath: string,
  summarizer?: ISummarizer
) => {
  summarizer = summarizer ?? new OllamaSummarizer();
  new IndexGenerator(summarizer).generateIndexMd(dirPath);
};

export type IndexGeneratorOpts = {
  fileProcessor?: SourceFileProcessor;
  createNodeSummarizer?: (summarizer: ISummarizer) => NodeSummarizer;
  createFileSummarizer?: (
    nodeSummarizer: NodeSummarizer,
    fileProcessor?: SourceFileProcessor
  ) => FileSummarizer;
};

class IndexGenerator {
  public summarizer: ISummarizer;
  public fileSummarizer: FileSummarizer;

  constructor(
    summarizer: ISummarizer,
    {
      fileProcessor,
      createNodeSummarizer,
      createFileSummarizer,
    }: IndexGeneratorOpts = {}
  ) {
    this.summarizer = summarizer;
    const nodeSummarizer = createNodeSummarizer
      ? createNodeSummarizer(summarizer)
      : new NodeSummarizer(summarizer);
    this.fileSummarizer = createFileSummarizer
      ? createFileSummarizer(nodeSummarizer, fileProcessor)
      : new FileSummarizer(nodeSummarizer, fileProcessor);

    generateContext.summarizer = summarizer;
  }

  public async generateIndexMd(dirPath: string) {
    await this.processDirectory(dirPath);
  }

  private async processDirectory(dirPath: string) {
    return await new DirectoryProcessor(this).processRootDirectory(dirPath);
  }
}

export { IndexGenerator };

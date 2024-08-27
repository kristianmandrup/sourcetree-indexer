import fs from "fs-extra";
import path from "path";
import { Summarizer } from "./summarizer/summarizer";
import {
  FileSummarizer,
  SUPPORTED_EXTENSIONS,
  NodeSummary,
  SourceFileProcessor,
  NodeSummarizer,
} from "./file-summarizer";
import { DirectoryProcessor } from "./directory-processor/directory-processor";
import { appContext } from "./app-context";

export const generateIndexMd = async (
  dirPath: string,
  summarizer: Summarizer
) => {
  new IndexGenerator(summarizer).generateIndexMd(dirPath);
};

export type IndexGeneratorOpts = {
  fileProcessor?: SourceFileProcessor;
  createNodeSummarizer?: (summarizer: Summarizer) => NodeSummarizer;
  createFileSummarizer?: (
    nodeSummarizer: NodeSummarizer,
    fileProcessor?: SourceFileProcessor
  ) => FileSummarizer;
};

class IndexGenerator {
  public summarizer: Summarizer;
  public fileSummarizer: FileSummarizer;

  constructor(
    summarizer: Summarizer,
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

    appContext.summarizer = summarizer;
  }

  public async generateIndexMd(dirPath: string) {
    await this.processDirectory(dirPath);
  }

  private async processDirectory(dirPath: string) {
    return await new DirectoryProcessor(this).processDirectory(dirPath);
  }
}

export { IndexGenerator };

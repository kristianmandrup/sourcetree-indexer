import { ISummarizer } from "../../summarizer";
import { FileSummarizer } from "./file-processor";

export type GenerateRuntimeOpts = {
  toc?: boolean;
  analyze?: boolean;
  suggest?: boolean;
  types?: boolean;
  force?: boolean;
};

export class GenerateContext {
  runtimeOpts: GenerateRuntimeOpts;
  summarizer?: ISummarizer;
  fileSummarizer?: FileSummarizer;

  constructor(runtimeOpts: GenerateRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
  }

  setOpts(runtimeOpts: GenerateRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
    return this;
  }

  setSummarizer(summarizer: ISummarizer) {
    this.summarizer = summarizer;
    return this;
  }

  setFileSummarizer(fileSummarizer: FileSummarizer) {
    this.fileSummarizer = fileSummarizer;
    return this;
  }
}

export const createGenerateContext = (runtimeOpts: GenerateRuntimeOpts = {}) =>
  new GenerateContext(runtimeOpts);

export const generateContext = createGenerateContext();

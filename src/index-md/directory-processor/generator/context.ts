import { ISummarizer } from "../../summarizer";

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
}

export const createGenerateContext = (runtimeOpts: GenerateRuntimeOpts = {}) =>
  new GenerateContext(runtimeOpts);

export const generateContext = createGenerateContext();

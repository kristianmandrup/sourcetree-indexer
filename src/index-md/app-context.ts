import { Summarizer } from "./summarizer";

export type GenerateRuntimeOpts = {
  toc?: boolean;
  analyze?: boolean;
  suggest?: boolean;
  types?: boolean;
  force?: boolean;
};

export type CleanupRuntimeOpts = {
  json?: boolean;
};

export class CleanupContext {
  runtimeOpts: CleanupRuntimeOpts;
  summarizer?: Summarizer;

  constructor(runtimeOpts: CleanupRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
  }

  setOpts(runtimeOpts: CleanupRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
    return this;
  }
}

export const createCleanupContext = (runtimeOpts: CleanupRuntimeOpts = {}) =>
  new CleanupContext(runtimeOpts);

export const cleanupContext = createCleanupContext();

export type FindRuntimeOpts = {
  tags?: string[];
};

export class FindContext {
  runtimeOpts: FindRuntimeOpts;
  summarizer?: Summarizer;

  constructor(runtimeOpts: FindRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
  }

  setOpts(runtimeOpts: FindRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
    return this;
  }
}

export const createFindContext = (runtimeOpts: FindRuntimeOpts = {}) =>
  new FindContext(runtimeOpts);

export const findContext = createFindContext();

export class GenerateContext {
  runtimeOpts: GenerateRuntimeOpts;
  summarizer?: Summarizer;

  constructor(runtimeOpts: GenerateRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
  }

  setOpts(runtimeOpts: GenerateRuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
    return this;
  }

  setSummarizer(summarizer: Summarizer) {
    this.summarizer = summarizer;
    return this;
  }
}

export const createGenerateContext = (runtimeOpts: GenerateRuntimeOpts = {}) =>
  new GenerateContext(runtimeOpts);

export const generateContext = createGenerateContext();

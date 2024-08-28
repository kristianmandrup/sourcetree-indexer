import { Summarizer } from "./summarizer";

export type RuntimeOpts = {
  toc?: boolean;
  analyze?: boolean;
  suggest?: boolean;
  types?: boolean;
  force?: boolean;
};

export class AppContext {
  runtimeOpts: RuntimeOpts;
  summarizer?: Summarizer;

  constructor(runtimeOpts: RuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
  }

  setOpts(runtimeOpts: RuntimeOpts = {}) {
    this.runtimeOpts = runtimeOpts;
    return this;
  }

  setSummarizer(summarizer: Summarizer) {
    this.summarizer = summarizer;
    return this;
  }
}

export const createAppContext = (runtimeOpts: RuntimeOpts = {}) =>
  new AppContext(runtimeOpts);

export const appContext = createAppContext();

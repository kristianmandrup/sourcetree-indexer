export type FindRuntimeOpts = {
  tags?: string[];
};

export class FindContext {
  runtimeOpts: FindRuntimeOpts;

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

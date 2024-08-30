export type CleanupRuntimeOpts = {
  json?: boolean;
};

export class CleanupContext {
  runtimeOpts: CleanupRuntimeOpts;

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

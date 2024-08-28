import { CodeComplexity, NodeSummary } from "../file-summarizer";

export type BaseSummary = {
  name: string;
  text: string;
  timestamp?: string;
};

// f.ex footer, header, complexity etc
export type Section = {
  name: string;
  text: string;
};

export type BaseFileSummary = BaseSummary & {
  sections?: Section[];
  complexity?: CodeComplexity;
  suggestions?: string;
};

export type DirectorySummary = BaseFileSummary & {
  files: FileOrDirSummary[];
};

export type FileSummary = BaseFileSummary & {
  nodes: NodeSummary[];
};

export type FileOrDirSummary = FileSummary | DirectorySummary;

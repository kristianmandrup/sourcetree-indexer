import { CodeComplexity, NodeSummary } from "./file-processor/file-summarizer";

export type SummaryType = "file" | "folder" | "section" | "node";

export type BaseSummary = {
  name: string;
  text: string;
  timestamp?: string;
  type: SummaryType;
  tags?: string[];
  slug?: string;
  lv?: number;
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

export type SectionSummary = BaseFileSummary & {
  complexity?: CodeComplexity;
  suggestions?: string;
};

export type FileOrDirSummary = FileSummary | DirectorySummary;

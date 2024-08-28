import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  MethodDeclaration,
  TypeAliasDeclaration,
  VariableDeclaration,
} from "ts-morph";
import { CodeComplexity } from "../code-analyzer";
import { BaseSummary } from "../../directory-processor/types";

export type NodeKind =
  | "class"
  | "function"
  | "interface"
  | "type"
  | "method"
  | "enum";

export type NodeSummary = BaseSummary & {
  kind: NodeKind; // "class" | "function" | "interface" | "type" | "method" | "enum";
  methods?: NodeSummary[];
  complexity?: CodeComplexity;
  suggestions?: string;
  sortNum?: number;
};

export type JsDocNode = ClassDeclaration | FunctionDeclaration;

export type ExportableNode =
  | ClassDeclaration
  | FunctionDeclaration
  | VariableDeclaration
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | EnumDeclaration;

export type SummarizableNode = ExportableNode | MethodDeclaration;

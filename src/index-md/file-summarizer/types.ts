import {
  ClassDeclaration,
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  MethodDeclaration,
  TypeAliasDeclaration,
  VariableDeclaration,
} from "ts-morph";

export type NodeKind =
  | "class"
  | "function"
  | "interface"
  | "type"
  | "method"
  | "enum";

export interface NodeSummary {
  name: string;
  text: string;
  kind: NodeKind; // "class" | "function" | "interface" | "type" | "method" | "enum";
  methods?: NodeSummary[];
}

export type JsDocNode = ClassDeclaration | FunctionDeclaration;

export type ExportableNode =
  | ClassDeclaration
  | FunctionDeclaration
  | VariableDeclaration
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | EnumDeclaration;

export type SummarizableNode = ExportableNode | MethodDeclaration;

import { Project, SourceFile } from "ts-morph";
import path from "node:path";
import { SUPPORTED_EXTENSIONS } from "./constants";

export class SourceFileProcessor {
  getSourceFile(filePath: string): SourceFile {
    const project = new Project();
    return project.addSourceFileAtPath(filePath);
  }

  validateExt(filePath: string): boolean {
    const ext = path.extname(filePath);
    return SUPPORTED_EXTENSIONS.includes(ext);
  }
}

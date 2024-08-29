import fs from "fs-extra";
import path from "path";

export class BaseDirectoryProcessor {
  get indexFileName() {
    return ".Index.md";
  }

  hasFileAt(filePath: string) {
    return fs.existsSync(filePath);
  }

  isDirectory(fullPath: string) {
    const stats = fs.statSync(fullPath);
    return stats.isDirectory();
  }

  getDirectoryFiles(dirPath: string) {
    return fs.readdirSync(dirPath);
  }

  indexMdFileNameFor(dirPath: string) {
    return path.join(dirPath, this.indexFileName);
  }
}

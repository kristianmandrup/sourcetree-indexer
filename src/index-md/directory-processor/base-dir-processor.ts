import fs from "fs-extra";
import path from "path";

export class BaseDirectoryProcessor {
  get indexFileName() {
    return ".Index.md";
  }

  get indexJsonFileName() {
    return ".index.json";
  }

  getDirectoryFiles(dirPath: string) {
    return fs.readdirSync(dirPath);
  }

  hasFileAtSync(filePath: string) {
    return fs.existsSync(filePath);
  }

  async hasFileAt(filePath: string) {
    return await fs.exists(filePath);
  }

  isDirectory(fullPath: string) {
    const stats = fs.statSync(fullPath);
    return stats.isDirectory();
  }

  indexMdFileNameFor(dirPath: string) {
    return path.join(dirPath, this.indexFileName);
  }

  indexJsonFileNameFor(dirPath: string) {
    return path.join(dirPath, this.indexJsonFileName);
  }
}

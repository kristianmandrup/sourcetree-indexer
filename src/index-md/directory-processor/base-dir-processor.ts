import path from "path";
import { FileSystem, IFileSystem } from "./file-system";

export class BaseDirectoryProcessor {
  fileSystem: IFileSystem = new FileSystem();

  get indexFileName() {
    return ".Index.md";
  }

  get indexJsonFileName() {
    return ".index.json";
  }

  getDirectoryFiles(dirPath: string) {
    return this.fileSystem.getDirectoryFiles(dirPath);
  }

  hasFileAtSync(filePath: string) {
    return this.fileSystem.hasFileAtSync(filePath);
  }

  async hasFileAt(filePath: string) {
    return await this.fileSystem.hasFileAt(filePath);
  }

  isDirectory(fullPath: string) {
    return this.fileSystem.isDirectorySync(fullPath);
  }

  indexMdFileNameFor(dirPath: string) {
    return path.join(dirPath, this.indexFileName);
  }

  indexJsonFileNameFor(dirPath: string) {
    return path.join(dirPath, this.indexJsonFileName);
  }
}

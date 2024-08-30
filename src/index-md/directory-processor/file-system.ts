import fs from "fs-extra";

export interface IFileSystem {
  getDirectoryFilesSync(dirPath: string): string[];
  getDirectoryFiles(dirPath: string): Promise<string[]>;
  hasFileAtSync(filePath: string): boolean;
  hasFileAt(filePath: string): Promise<boolean>;
  isDirectorySync(fullPath: string): boolean;
  isDirectory(fullPath: string): Promise<boolean>;
}

export class FileSystem implements IFileSystem {
  getDirectoryFilesSync(dirPath: string) {
    return fs.readdirSync(dirPath);
  }

  async getDirectoryFiles(dirPath: string) {
    return await fs.readdirSync(dirPath);
  }

  hasFileAtSync(filePath: string) {
    return fs.existsSync(filePath);
  }

  async hasFileAt(filePath: string) {
    return await fs.exists(filePath);
  }

  isDirectorySync(fullPath: string) {
    const stats = fs.statSync(fullPath);
    return stats.isDirectory();
  }

  async isDirectory(fullPath: string) {
    const stats = await fs.stat(fullPath);
    return stats.isDirectory();
  }
}

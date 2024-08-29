import path from "path";
import fs from "fs-extra";
import { BaseDirectoryProcessor } from "./base-dir-processor";

export class DirectoryCleaner extends BaseDirectoryProcessor {
  // TODO: extract to class
  public async deleteIndexFiles(
    dirPath: string,
    lv: number = 0
  ): Promise<void> {
    console.log("processing", dirPath);
    const files = this.getDirectoryFiles(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (this.isDirectory(fullPath)) {
        const indexMdPath = this.indexMdFileNameFor(fullPath);
        await this.deleteFile(indexMdPath);
        await this.deleteIndexFiles(fullPath, lv++);
      }
    }
  }

  protected deleteFileSync(filePath: string) {
    if (!this.hasFileAt(filePath)) return;
    fs.removeSync(filePath);
  }

  protected async deleteFile(filePath: string) {
    await fs.remove(filePath);
  }
}

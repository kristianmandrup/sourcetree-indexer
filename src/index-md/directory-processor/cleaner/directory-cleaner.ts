import path from "path";
import fs from "fs-extra";
import { BaseDirectoryProcessor } from "../base-dir-processor";
import { cleanupContext } from "./context";

export class DirectoryCleaner extends BaseDirectoryProcessor {
  public async deleteIndexFiles(
    dirPath: string,
    lv: number = 0
  ): Promise<void> {
    console.log("processing", dirPath);
    const files = this.getDirectoryFiles(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (this.isDirectory(fullPath)) {
        await this.deleteIndexFilesAt(fullPath);
        await this.deleteIndexFiles(fullPath, lv++);
      }
    }
  }

  protected async deleteIndexFilesAt(fullPath: string) {
    await this.deleteIndexMdFileAt(fullPath);
    await this.deleteIndexJsonFileAt(fullPath);
  }

  protected async deleteIndexJsonFileAt(fullPath: string) {
    if (!cleanupContext.runtimeOpts.json) return;
    const indexJsonPath = this.indexJsonFileNameFor(fullPath);
    await this.deleteFile(indexJsonPath);
  }

  protected async deleteIndexMdFileAt(fullPath: string) {
    const indexMdPath = this.indexMdFileNameFor(fullPath);
    await this.deleteFile(indexMdPath);
  }

  protected deleteFileSync(filePath: string) {
    if (!this.hasFileAtSync(filePath)) return;
    fs.removeSync(filePath);
  }

  protected async deleteFile(filePath: string) {
    if (!(await this.hasFileAt(filePath))) return;
    await fs.remove(filePath);
  }
}

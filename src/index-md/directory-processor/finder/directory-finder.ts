import path from "path";
import fs from "fs-extra";
import { BaseDirectoryProcessor } from "../base-dir-processor";

type IndexMatch = {
  dirPath: string;
  matchRank: number;
};

export class DirectoryFinder extends BaseDirectoryProcessor {
  constructor(private readonly searchTerm: string) {
    super();
  }

  public async findFrom(dirPath: string): Promise<IndexMatch[]> {
    const matches = await this.findMatchingIndexFiles(dirPath, 0);
    return matches;
  }

  public async findMatchingIndexFiles(
    dirPath: string,
    lv: number = 0
  ): Promise<IndexMatch[]> {
    const allMatches: IndexMatch[] = [];
    console.log("processing", dirPath);
    const files = this.getDirectoryFiles(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      if (this.isDirectory(fullPath)) {
        await this.matchIndexFilesAt(fullPath);
        const matches = await this.findMatchingIndexFiles(fullPath, lv++);
        if (matches) {
          allMatches.push(...matches);
        }
      }
    }
    return allMatches;
  }

  protected async matchIndexFilesAt(fullPath: string) {
    const matchMd = await this.matchIndexMdFileAt(fullPath);
    const matchJson = await this.matchIndexJsonFileAt(fullPath);
    const matches = [matchMd, matchJson].filter((m) => m);
    if (matches.length === 0) return;
    return matches;
  }

  protected async matchIndexJsonFileAt(dirPath: string) {
    // if (!cleanupContext.runtimeOpts.json) return;
    const indexJsonPath = this.indexJsonFileNameFor(dirPath);
    if (!(await this.hasFileAt(indexJsonPath))) return;
    const json = await fs.readJSON(indexJsonPath);
    /// TODO
    if (!json.tags.includes(this.searchTerm)) return;
    return {
      dirPath,
      matchRank: 1,
    };
  }

  protected async matchIndexMdFileAt(dirPath: string) {
    const indexMdPath = this.indexMdFileNameFor(dirPath);
    if (!(await this.hasFileAt(indexMdPath))) return;
    const content = await fs.readFile(indexMdPath);
    // TODO: improve
    const matches = content.includes(this.searchTerm);
    if (!matches) return;
    return {
      dirPath,
      matchRank: 1,
    };
  }

  protected async matchJsonFile(filePath: string) {}
}

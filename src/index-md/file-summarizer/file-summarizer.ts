import { SourceFile } from "ts-morph";
import { NodeProcessor } from "./node";
import { NodeSummary } from "./node/types";
import { NodeSummarizer } from "./node";
import { SourceFileProcessor } from "./source-file-processor";

export class FileSummarizer {
  private nodeSummaryProcessor: NodeProcessor;
  private fileProcessor: SourceFileProcessor;
  private nodeSummarizer: NodeSummarizer;

  constructor(
    nodeSummarizer: NodeSummarizer,
    fileProcessor?: SourceFileProcessor
  ) {
    this.nodeSummarizer = nodeSummarizer;
    this.nodeSummaryProcessor = new NodeProcessor(nodeSummarizer);
    this.fileProcessor = fileProcessor || new SourceFileProcessor();
  }

  get summarizer() {
    return this.nodeSummarizer.summarizer;
  }

  getSourceFile(filePath: string) {
    if (!this.fileProcessor.validateExt(filePath)) return;
    return this.fileProcessor.getSourceFile(filePath);
  }

  getNodeProcessors(sourceFile: SourceFile) {
    return [
      sourceFile.getFunctions.bind(sourceFile),
      sourceFile.getClasses.bind(sourceFile),
      sourceFile.getVariableDeclarations.bind(sourceFile),
      sourceFile.getInterfaces.bind(sourceFile),
      sourceFile.getTypeAliases.bind(sourceFile),
      sourceFile.getEnums.bind(sourceFile),
    ];
  }

  public async readFileSummary(filePath: string): Promise<NodeSummary[]> {
    const sourceFile = this.getSourceFile(filePath);
    if (!sourceFile) return [];

    const nodeProcessors = this.getNodeProcessors(sourceFile);
    const summaries = await Promise.all(
      nodeProcessors.map((getNodes) =>
        this.nodeSummaryProcessor.process(getNodes)
      )
    );

    return summaries.flat();
  }
}

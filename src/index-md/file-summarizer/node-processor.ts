import { NodeSummarizer } from "./node-summarizer";
import { ExportableNode, NodeSummary, SummarizableNode } from "./types";

export class NodeProcessor {
  private nodeSummarizer: NodeSummarizer;

  constructor(nodeSummarizer: NodeSummarizer) {
    this.nodeSummarizer = nodeSummarizer;
  }

  private isExported(node: SummarizableNode) {
    return (node as ExportableNode).isExported();
  }

  public async process(
    getTypeNodes: () => SummarizableNode[]
  ): Promise<NodeSummary[]> {
    const summaries: NodeSummary[] = [];

    for (const node of getTypeNodes()) {
      if (this.isExported(node)) {
        const summary = await this.nodeSummarizer.summarizeNode(node);
        if (summary) summaries.push(summary);
      }
    }

    return summaries;
  }
}

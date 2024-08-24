declare module "comment-parser" {
  import { ParsedComment } from "comment-parser/lib/types"; // Adjust import path if necessary

  export function parse(source: string): ParsedComment[];
}

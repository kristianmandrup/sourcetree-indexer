import path from "path";

export class Anchor {
  constructor(private readonly fileName: string) {}

  sluggify(text: string): string {
    return text
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[\s\W-]+/g, "-") // Replace spaces and non-alphanumeric characters with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
  }

  generate(name: string) {
    const fileName = path.basename(this.fileName, path.extname(this.fileName));
    const anchorName = [fileName, name].join("-");
    const anchorLink = this.sluggify(anchorName);
    return `<a href="#${anchorLink}">${name}</a>`;
  }
}

type TFrontMatter = {
  [key: string]: string | string[];
};

export type TFrontMatterMarkdown = {
  frontmatter: TFrontMatter[];
  body: string;
};

function newLineAndIndent(markdownString: string, depth: number): string {
  if (depth === 0) {
    return `${markdownString}\n`;
  }
  const indent = " ".repeat(depth * 2);
  return `${markdownString}\n${indent}`;
}

export function transformMarkdownKeyValueToString(
  key: string,
  value: string | string[] | TFrontMatter | Error,
  markdownString: string,
  depth: number = 0
): string {
  try {
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        const arrayString = `${value.map((item) => `"${item}"`).join(", ")}`;
        return `${newLineAndIndent(
          markdownString,
          depth
        )}${key}: [${arrayString}]`;
      } else if (value instanceof Error) {
        return markdownString;
      } else {
        return Object.entries(value).reduce(
          (accString, [entryKey, entryValue]) => {
            return `${transformMarkdownKeyValueToString(
              entryKey,
              entryValue,
              accString,
              depth + 1
            )}`;
          },
          `${newLineAndIndent(markdownString, depth)}${key}:`
        );
      }
    } else {
      return `${newLineAndIndent(markdownString, depth)}${key}: "${value}"`;
    }
  } catch (err) {
    return `${newLineAndIndent(markdownString, depth)}${key}: ${JSON.stringify(
      value
    )}`;
  }
}

export function jsonToFrontmatterString(
  frontmatter: Record<string, any>
): string {
  let markdownString = `---`;
  Object.entries(frontmatter).forEach(([key, value]) => {
    markdownString = transformMarkdownKeyValueToString(
      key,
      value,
      markdownString
    );
  });
  markdownString = `${markdownString}\n---\n`;
  return markdownString;
}

export function transformToFrontmatterString(
  frontmatter: TFrontMatter[]
): string {
  let markdownString = `---`;
  frontmatter.forEach((frontmatterField) =>
    Object.entries(frontmatterField).forEach(([key, value]) => {
      markdownString = transformMarkdownKeyValueToString(
        key,
        value,
        markdownString
      );
    })
  );
  markdownString = `${markdownString}\n---\n`;
  return markdownString;
}

export function transformToMarkdownString(
  frontmatterMarkdown: TFrontMatterMarkdown
): string {
  let markdownString = `---`;
  frontmatterMarkdown.frontmatter.forEach((frontmatterField) =>
    Object.entries(frontmatterField).forEach(([key, value]) => {
      markdownString = transformMarkdownKeyValueToString(
        key,
        value,
        markdownString
      );
    })
  );

  markdownString = `${markdownString}\n---`;
  try {
    markdownString = `${markdownString}\n${frontmatterMarkdown.body}`;
  } catch (e) {
    markdownString = `${markdownString}\n${JSON.stringify(
      frontmatterMarkdown.body
    )}`;
  }
  // TODO implement the transform
  return markdownString;
}

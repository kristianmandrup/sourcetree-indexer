# Index markdown generator

Recursively iterates through a folder structure for a given folder:

- Generates an `.Index.md` file inside each folder summarizing it from a code perspective.

This can be useful for a human developer or AI agent to quickly get an overall idea of what is inside the folders of an existing project.

## Example output

`.Index.md`

```md
## folder : file-sys

The `InMemoryFileSystemHost` class offers in-memory file operations with case sensitivity options, and includes methods like `delete()` (synchronous) for file deletion, `deleteSync()` to remove directories/files, and `readDirSync()` for syncing directory contents.
```

`file-sys/.Index.md`

```md
## file : file-sys.ts

### InMemoryFileSystem

`InMemoryFileSystem` provides an in-memory implementation of a File System Host for synchronous and asynchronous file operations.

- isCaseSensitive: Checks if input comparison is case-sensitive.

- delete: This function synchronously deletes a file at the specified path and returns a resolved promise or rejects with an error if failure occurs.

- deleteSync: Deletes a synchronization reference for the specified path, removing associated directories and files if present.

- readDirSync: Reads and synchronizes directory contents at specified path as an array of runtime directory entries.
```

## Quick start

To run and test locally: Build and link

```bash
pnpm build
```

`node dist/generate-index.js ./data --service ollama --model phi3:14b`

Link to install package on your system

```bash
pnpm link
```

Alternatively: use `npx` or install globally

If you want to use OpenAI, define a key in a `.env` file (see `.env.example`)

### OpenAI

See [Available models](https://platform.openai.com/docs/models) here

Run with OpenAI model (format)

```bash
generate-index-md <dirPath> --apiKey <your-api-key> --service openai --model <model>
```

Example

```bash
generate-index-md ./data/parser --service openai --model gpt-4
```

### Ollama

Running with [phi3:mini](https://ollama.com/library/phi3:mini) open AI model from MicroSoft

```bash
ollama serve
ollama pull phi3:mini
ollama run phi3:mini
```

Run with Ollama model (format)

```bash
generate-index-md <dirPath> --service ollama --model <model>
```

Example

```bash
generate-index-md ./data/parser --service ollama --model phi3:mini
```

## TODO

- Add more run options (TOC, force, analysis)
- Turn `file` header into separate summary type with `processFileSummary` method
- By default it should only process files in a folder modified/created since last timestamp (use `force` option to process all)
- Add meta data at the top of each file (`timestamp`, `tags`) using YAML frontmatter
- Cleanup option to delete all `.Index.md` files
- For each entry if `analysis` is turned on

  - Complexity analysis
    - Code entry complexity : 0-5 - Very Low (1), Low (2), Medium (3), High (4), Very High (5)
    - File complexity: summarized complexity score based on number of entries and their complexity
    - Folder complexity: depending on the number of files and subfolders and the total complexity of each
  - Refactoring suggestions
    - Entry
    - File
    - Folder

- VS Code plugin

### Metadata

Use [YAML frontmatter](https://github.blog/news-insights/product-news/viewing-yaml-metadata-in-your-documents/)
How to [parse](https://peterbabic.dev/blog/yaml-metadata-in-markdown/) via:

- [remark-frontmatter](https://www.npmjs.com/package/remark-frontmatter) for full markdown parsing if needed
- [frontmatter](https://www.npmjs.com/package/frontmatter) for just the frontmatter

```md
---
layout: post
title: Blogging Like a Hacker
---
```

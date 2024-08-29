# Sourcetree indexer

The Sourcetree indexer contains the following tools:

- Indexer: `index-sourcetree`
- Searcher: `search-sourcetree`
- Cleaner: `cleanup-indexes`

## Indexer

Recursively iterates through a folder structure:

Inside each folder:

- Generates an `.Index.md` markdown file, summarizing the folder from a code perspective.
- Generates an `.index.json` file, with a JSON summary, ideal for agents and other tools to use

This can be useful for a human developer or AI agent to quickly get an overall idea of what is inside the folders of an existing project.

## Searcher

Recursively iterates through a folder structure and examines index files generated previously.

- Searches `.Index.md` markdown file for a match
- Searches `.index.json` for a match (optional)

## Cleaner

Recursively iterates through a folder structure and cleans up (ie. deletes) index files generated previously.

## Generator: Example output

The tool can now generate YAML frontmatter with metadata in the `Index.md` file. This can be used for the agent to quickly determine the relevance of the folder.
As the tool runs, it will check the last modified date of each folder/file and compare each with the timestamp from the `Index.md` metadata.
The tool will by default only process folders and files that have been updated since the last run. This can greatly reduce the compute/time necesary on successive runs.

The following is an sample of a generated output on a folder with a single file `block-parser.ts`

`.Index.md`

````md
---
timestamp: "2024-08-28 14:16:18"
tags:
  [
    "StructuredCodeExtraction",
    "ParsingInterface",
    "OptionsConfiguration",
    "LineParser",
    "CodeBlockValidation",
    "FencingDelimiters",
  ]
---

## Folder : ./data/parser

## File : block-parser.ts

The `getParser` utility exports a parser function tailored to transform source lines into structured code blocks, utilizing customizable fencing delimiters for content demarcation. It incorporates the `Options` interface allowing users to define escape sequences or predicates for these delimiters and leverages the `Parser` type which outputs an array of parsed line objects. Additionally, it uses a `Fencer` function that evaluates source inputs based on predefined conditions to determine block demarcations.

### Function: <a href="#block-parser-getparser">getParser</a>

Exports a parser function generating structured code blocks from source lines using customizable fencing delimiters for content grouping.

### Interface: <a href="#block-parser-options">Options</a>

The `Options` interface defines an exported options structure for specifying a fencing escape sequence or predicate.

### Type: <a href="#block-parser-parser">Parser</a>

Parser function type exports parsing blocks into arrays of parsed lines.

### Type: <a href="#block-parser-fencer">Fencer</a>

Fencer is an exported type function that accepts a source input and returns a boolean indicating if conditions are met.

### Footer

#### Code Complexity

Score: 3 (Medium)

#### Code improvement suggestions

- **Refactor `getParser` to accept the options object directly**, allowing for better flexibility.
  - Extract fencing logic into the `Options` interface and separate handling in `getParser`.
- **Create `Parser` type alias** rather than a function type if applicable.
- **Extract method pattern**: Split `getParser` functionality based on its responsibilities (e.g., parsing, applying options).
  - Extract fencing logic into a new `Fencer` class or higher-order function that takes conditions and returns a boolean.
- **Return early refactoring**: In the `Parser` implementation, avoid deep nesting by checking for base cases first (e.g., empty input) before proceeding with parsing logic.
  - Use separate methods to handle different fencing scenarios within the parser function.
- **Options interface refinement**:
  - Ensure it clearly defines properties related to escaping sequences and predicates, possibly including getters for easy access.
- **Documentation improvements**: Consider adding comments or JSDoc above each method/class explaining their purpose. This enhances readability and maintainability.```
````

Note that if you run without passing the `--types` option, it will only summarize exported functions, classes and variable declarations.

`file-sys/.Index.md`

The following demonstrates the markdown summary generated for a file with a class `InMemoryFileSystem`

```md
## file : file-sys.ts

### InMemoryFileSystem

`InMemoryFileSystem` provides an in-memory implementation of a File System Host for synchronous and asynchronous file operations.

#### Method : isCaseSensitive

Checks if input comparison is case-sensitive.

#### Method : delete

This function synchronously deletes a file at the specified path and returns a resolved promise or rejects with an error if failure occurs.

#### Method : deleteSync

Deletes a synchronization reference for the specified path, removing associated directories and files if present.

#### Method readDirSync

Reads and synchronizes directory contents at specified path as an array of runtime directory entries.
```

## Quick start

To run and test locally: Build and link

```bash
pnpm build
```

`node dist/generate.js ./data --service ollama --model phi3:medium`

Link to install package on your system

```bash
pnpm link
```

If you want to use OpenAI, define a key in a `.env` file (see `.env.example`)

## Cleanup index files

This tool will cleanup all the `.Index.md` files previously generated

`node dist/cleanup.js ./lib/components`

Via binary

`cleanup-indexes ./lib/components`

### Run options

```md
Arguments:
dirPath Directory path to process

Options:
-V, --version output the version number
-a, --apiKey <apiKey> API key for the summarizer service (currently only for OpenAI) (default: "")
-m, --model <model> Model name (default: "phi3:mini")
-s, --service <service> Summarizer service: "openai" or "ollama" (default: "ollama")
-u, --suggest Make improvement suggestions (default: false)
-t, --toc Table of Contents (default: false)
-y, --types Summarize types, interfaces and enums (default: false)
-n, --analyze Perform code and complexity analysis (default: false)
-f, --force Force processing of all files (default: false)
-h, --help display help for command
```

### OpenAI

See [Available models](https://platform.openai.com/docs/models) here

Run with OpenAI model (format)

```bash
index-sourcetree <dirPath> --apiKey <your-api-key> --service openai --model <model>
```

Example

```bash
index-sourcetree ./data/parser --service openai --model gpt-4
```

### Ollama

Example: running with [phi3:mini](https://ollama.com/library/phi3:mini) open AI model from MicroSoft

```bash
ollama serve
ollama pull phi3:mini
ollama run phi3:mini
```

Run with Ollama model (format)

```bash
index-sourcetree <dirPath> --service ollama --model <model>
```

Example

```bash
index-sourcetree ./data/parser --service ollama --model phi3:mini
```

## TODO

- Let tags bubble up from subfolder metadata
- Finder: search on `.index.json` files that have tags or filenames/folders matching search term
- Generate proper TOCs using slugs stored on summaries [-]
- Improved complexity analysis and suggestions
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

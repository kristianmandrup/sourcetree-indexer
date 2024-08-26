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

- Code complexity (0-5 Very Low to Very High)
- Refactoring suggestions
- VS Code plugin

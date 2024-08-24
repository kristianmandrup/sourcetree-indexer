# Index markdown generator

Recursively iterates through a folder structure for a given folder:

- Generates an Index.md file inside each folder summarizing it from a code perspective.

This can be useful for a human developer or AI agent to quickly get an overall idea of what is inside the folders of an existing project.

## Quick start

To run and test locally: Build and link

```bash
pnpm build
pnpm link
```

Alternatively use `npx` or install globally

If you want to use OpenAI, define a key in a `.env` file (see `.env.example`)

### OpenAI

Run with OpenAI model

```bash
generate-index-md <dirPath> --apiKey <your-api-key> --service openai --model gpt-4
```

### Ollama

Run with Ollama model

```bash
generate-index-md <dirPath> --apiKey <your-api-key> --service ollama
```

# Index markdown generator

Recursively iterates through a folder structure for a given folder:

- Generates an Index.md file inside each folder summarizing it from a code perspective.

This can be useful for a human developer or AI agent to quickly get an overall idea of what is inside the folders of an existing project.

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

Alternatively use `npx` or install globally

If you want to use OpenAI, define a key in a `.env` file (see `.env.example`)

### OpenAI

See [Available models](https://platform.openai.com/docs/models) here

Run with OpenAI model

```bash
generate-index-md <dirPath> --apiKey <your-api-key> --service openai --model gpt-4
```

### Ollama

Running with [phi3:14b](https://ollama.com/library/phi3:14b) open AI model from MicroSoft

```bash
ollama serve
ollama pull phi3:14b
ollama run phi3:14b
```

Run with Ollama model

```bash
generate-index-md <dirPath> --apiKey <your-api-key> --service ollama --model phi3:14b
```

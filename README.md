# YAG OpenAPI — Yet Another Generator for OpenAPI

Type-first DX for your client apps with zero runtime overhead. This project turns your OpenAPI schema(s) into framework-specific TypeScript client types and model types via a Vite plugin and virtual modules.

## Main idea

- Consume OpenAPI in your frontend without generating files into your source tree.
- Get framework-friendly typed clients (Hono, Elysia) as virtual modules.
- Import all schema models as TypeScript types from a single virtual package.
- Regenerate types automatically when schemas change (file or remote sources).

## Features

- Virtual modules with type-only declarations:
	- `@yag-openapi/client/hono` — Hono client types.
	- `@yag-openapi/client/elysia` — Elysia Eden client types.
	- `@yag-openapi/client` — Models grouped by source name (namespaced to avoid collisions).
- File and remote sources:
	- File source with optional watch mode.
	- Remote source with polling and custom headers/fetch support.
- No runtime payload — only `.d.ts` is emitted under `node_modules/@types/yag-openapi`.

## Supported clients (currently)

- Hono Client (import { hc } from 'hono/client')
- Elysia Eden (import { treaty } from '@elysiajs/eden')

## Installation

Install in your Vite app (pnpm shown):

```sh
pnpm add -D @yag-openapi/vite-plugin @yag-openapi/core

# Install the client runtime you use (dev deps are fine for types)
pnpm add -D hono    # for Hono client
pnpm add @elysiajs/eden && pnpm add -D elysia    # for Elysia Eden client
```

## Quickstart (Vite)

Configure the plugin in `vite.config.ts` and point it at your schemas:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import yagOpenapi, { file, remote } from '@yag-openapi/vite-plugin';

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		yagOpenapi({
			TaskManagerApi: file('../api/swagger-spec.json', { watch: true }),
			PetsStoreApi: file('./data/petstore.openapi.json'),
			// Or remote source example:
			// ExternalApi: remote('https://api.example.com/openapi.json', { pollingInterval: 30000 })
		}),
	],
});
```

The plugin will emit types to `node_modules/@types/yag-openapi/index.d.ts` and expose virtual modules.

## Using the generated clients

Hono client:

```ts
import { hc } from 'hono/client';
import type { TaskManagerApi, PetsStoreApi } from '@yag-openapi/client/hono';

export const api = hc<TaskManagerApi>('http://localhost:3000');
export const pets = hc<PetsStoreApi>('https://petstore.swagger.io/v2');
```

Elysia Eden client:

```ts
import { treaty } from '@elysiajs/eden';
import type { TaskManagerApi, PetsStoreApi } from '@yag-openapi/client/elysia';

export const api = treaty<TaskManagerApi>('http://localhost:3000');
export const pets = treaty<PetsStoreApi>('https://petstore.swagger.io/v2');
```

## Using the generated models (types)

All component schemas are exported under a TypeScript namespace matching the source name. This avoids name collisions when using multiple schemas.

```ts
import type { TaskManagerApi } from '@yag-openapi/client';

// Example usage in React Query hooks
mutationFn: (data: TaskManagerApi.CreateTaskDto) => api.tasks.$post({ json: data }).then(r => r.json())

// Another
type UpdatePayload = TaskManagerApi.UpdateTaskDto;
```

## Sources

- file(path, { watch?: boolean })
	- Reads a local file. If `watch: true`, it listens for both `change` and `rename` events to handle atomic saves.
- remote(url, { pollingInterval?: number, headers?: Record<string,string>, customFetch?: (i,init)=>Promise<Response> })
	- Polls a remote endpoint and updates when content changes.

## Common use-cases

- Build typed frontend clients for Hono/Elysia backends directly from their OpenAPI.
- Share request/response DTO types with UI without codegen files in your repo.
- Work across multiple APIs safely — models are namespaced per source.

## Troubleshooting

- File path issues:
	- `[yag-openapi] Could not read OpenAPI schema file at <path>`
	- Ensure the path is correct relative to your Vite project root and the file exists.
- File watching errors:
	- `[yag-openapi] Failed to start file watcher for <path>`
	- Create the file before enabling watch; verify path.
- Remote errors:
	- `[yag-openapi] Failed to fetch OpenAPI schema from <url>`
	- Check URL, CORS, network; customize headers or provide a custom fetch if needed.

## Notes

- Only Hono Client and Elysia Eden are supported currently.
- The plugin writes `.d.ts` to `node_modules/@types/yag-openapi`. Editors should pick this up automatically.

---

MIT License
# @yag-openapi/vite-plugin

Vite plugin for [yag-openapi](https://github.com/karerckor/yag-openapi) integration.  
Generates **type-safe clients** and **models** from your OpenAPI specification — both local and remote — with out-of-the-box support for **Hono** and **Elysia** frameworks.

---

## ✨ Features
- **Automatic type generation** from OpenAPI JSON specs
- **Local file** or **remote URL** as schema source
- **Polling** for remote changes & **watch mode** for local files
- Namespace isolation for each defined schema
- Works seamlessly with:
  - [`@yag-openapi/client`](#models)
  - [`@yag-openapi/client/elysia`](#elysia-client)
  - [`@yag-openapi/client/hono`](#hono-client)

---

## 📦 Installation

```bash
pnpm add -D @yag-openapi/vite-plugin
# or
npm install -D @yag-openapi/vite-plugin
# or
yarn add -D @yag-openapi/vite-plugin
```
---

## ⚙️ Configuration

`vite.config.ts`

```typescript
import yagOpenApiPlugin, { file, remote } from '@yag-openapi/vite-plugin';

export default {
  plugins: [
    yagOpenApiPlugin({
      // Schema from remote URL, updates every 10 seconds
      RemoteApi: remote('https://example.com/openapi.json', {
        pollingInterval: 10_000, // ms
      }),

      // Schema from local file, rebuilds on change
      TaskManagerApi: file('../api/swagger-spec.json', {
        watch: true,
      }),
    }),
  ],
};
```

**💡 Schema keys (RemoteApi, TaskManagerApi) become namespaces in your generated types.**

---

## 📂 Generated Virtual Modules
After the plugin runs, you can import types and clients from these virtual modules:

### Models

```typescript
import type { TaskManagerApi } from '@yag-openapi/client';

// TaskManagerApi is a namespace with all `components.schemas`
// from your OpenAPI spec.
const task: TaskManagerApi.CreateTaskDto = {
  title: 'My Task',
  completed: false,
};
```

### Elysia Client

```typescript
import { treaty } from '@elysiajs/eden';
import type { TaskManagerApi, RemoteApi } from '@yag-openapi/client/elysia';

export const api = treaty<TaskManagerApi>('http://localhost:3000');
export const remoteApi = treaty<RemoteApi>('https://remote.api');
```

### Elyfia Eden Fetch

```typescript
import { edenFetch } from '@elysiajs/eden';
import type { TaskManagerApi, PetsStoreApi } from '@yag-openapi/client/elysia';

export const apiFetch = edenFetch<TaskManagerApi>('http://localhost:3000');
```

### Hono Client

```typescript
import { hc } from 'hono/client';
import type { TaskManagerApi, RemoteApi } from '@yag-openapi/client/hono';

export const api = hc<TaskManagerApi>('http://localhost:3000');
export const remoteApi = hc<RemoteApi>('https://remote.api');
```

--- 

## 🚀 Example: NestJS + React + TanStack Query

Clone and run the full example:

```bash
pnpx gitpick karerckor/yag-openapi/tree/main/examples/nestjs-react fullstack-example
cd fullstack-example
pnpm install
pnpm dev
```
# @yag-openapi/vite-plugin

Vite plugin for yag-openapi integration.

## Usage

```js
// vite.config.ts
import yagOpenApiPlugin from '@yag-openapi/vite-plugin';

export default {
  plugins: [yagOpenApiPlugin(/* options */)],
};
```

After the plugin runs, it provides virtual modules for type-only consumption:

- Framework clients:
  - `@yag-openapi/client/elysia`
  - `@yag-openapi/client/hono`
- Models (all OpenAPI components.schemas combined):
  - `@yag-openapi/client`

Example usage in your app code (types only):

```ts
import type { CreateTaskDto, UpdateTaskDto } from '@yag-openapi/client';
// or framework-specific types
import type { Routes as ElysiaRoutes } from '@yag-openapi/client/elysia';
import type { Routes as HonoRoutes } from '@yag-openapi/client/hono';
```

## Development

- `pnpm build` — build the plugin
- `pnpm dev` — watch mode
- `pnpm clean` — remove dist

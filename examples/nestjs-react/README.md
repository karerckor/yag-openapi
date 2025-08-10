# Full-stack Example: NestJS API + React Client with @yag-openapi/vite-plugin

This example demonstrates a full-stack workflow using:
- **NestJS** for the backend API (auto-generates OpenAPI spec at `api/swagger-spec.json`)
- **React + Vite** for the frontend, with type-safe API calls powered by [`@yag-openapi/vite-plugin`](https://www.npmjs.com/package/@yag-openapi/vite-plugin)

## Features

- **Automatic OpenAPI spec**: The NestJS API generates `swagger-spec.json` on build.
- **Type-safe client**: The React app uses `@yag-openapi/vite-plugin` to generate fully-typed API clients and models from the OpenAPI spec at build time.
- **Live contract**: Any change in the backend OpenAPI spec is instantly reflected in the frontend types and hooks.

---

## Getting Started

### 1. Install dependencies

```bash
# In the root of this example
(cd api && pnpm install)
(cd webapp && pnpm install)
```

### 2. Setup and migrate the database

```bash
cd api
echo 'DATABASE_URL="file:../data/local.db"' > .env
pnpx prisma migrate dev
pnpx prisma generate
```

### 3. Start the API server

```bash
cd api
pnpm start:dev
```

### 4. Start the React app

```bash
cd webapp
pnpm dev
# The app will be available at http://localhost:5173
```

---

## How it works

- The NestJS API exposes an OpenAPI spec at `api/swagger-spec.json`.
- The React app is configured with `@yag-openapi/vite-plugin` in `vite.config.ts` to read this spec and generate:
	- Typed API clients (for Hono and Elysia)
	- Typed models (DTOs, etc.)
- You can import types and clients in your React code, e.g.:
	```ts
	import type { TaskManagerApi } from '@yag-openapi/client';
	import { createClient } from '@yag-openapi/client/hono';
	```
- Any change to the backend API (controllers, DTOs) will update the OpenAPI spec and, after a rebuild, update the frontend types automatically.

---

## Project Structure

```
examples/nestjs-react/
	api/      # NestJS backend (OpenAPI spec at swagger-spec.json)
	webapp/   # React + Vite frontend (uses @yag-openapi/vite-plugin)
```

---

## Useful scripts

- `pnpm install` — install all dependencies
- `pnpm start:dev` (in `api/`) — start the NestJS API in dev mode
- `pnpm dev` (in `webapp/`) — start the React app in dev mode

---

## Learn more

- [@yag-openapi/vite-plugin documentation](https://github.com/karerckor/yag-openapi)
- [NestJS](https://nestjs.com/)
- [Vite](https://vitejs.dev/)

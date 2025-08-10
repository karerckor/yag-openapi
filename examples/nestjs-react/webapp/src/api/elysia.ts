import { treaty } from '@elysiajs/eden';
import type { TaskManagerApi, PetsStoreApi } from '@yag-openapi/client/elysia';

export const api = treaty<TaskManagerApi>('http://localhost:3000');

export const pets = treaty<PetsStoreApi>('https://petstore.swagger.io/v2');


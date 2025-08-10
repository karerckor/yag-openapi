import { hc } from "hono/client";
import {
  type PetsStoreApi,
  type TaskManagerApi,
} from "@yag-openapi/client/hono";

export const api = hc<TaskManagerApi>("http://localhost:3000");
export const pets = hc<PetsStoreApi>("https://petstore.swagger.io/v2");

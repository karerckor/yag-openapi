import type { TaskManagerApi } from "@yag-openapi/client";

// Task related types
export type CreateTaskFn = (
  data: TaskManagerApi.CreateTaskDto
) => Promise<TaskManagerApi.TaskDto>;
export type UpdateTaskFn = (
  id: number,
  data: TaskManagerApi.UpdateTaskDto
) => Promise<TaskManagerApi.TaskDto>;
export type DeleteTaskFn = (id: number) => Promise<void>;

// Column related types
export type CreateColumnFn = (
  data: TaskManagerApi.CreateColumnDto
) => Promise<TaskManagerApi.ColumnDto>;
export type UpdateColumnFn = (
  id: number,
  data: TaskManagerApi.UpdateColumnDto
) => Promise<TaskManagerApi.ColumnDto>;
export type DeleteColumnFn = (id: number) => Promise<void>;

// Category related types
export type CreateCategoryFn = (
  data: TaskManagerApi.CreateCategoryDto
) => Promise<TaskManagerApi.CategoryDto>;
export type UpdateCategoryFn = (
  id: number,
  data: TaskManagerApi.UpdateCategoryDto
) => Promise<TaskManagerApi.CategoryDto>;
export type DeleteCategoryFn = (id: number) => Promise<void>;

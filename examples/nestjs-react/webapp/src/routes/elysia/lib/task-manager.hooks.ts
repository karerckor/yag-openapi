import type { TaskManagerApi } from "@yag-openapi/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

// #region Task Management Hooks
export function useTasks(query: Parameters<typeof api.tasks.get>[0]) {
  return useQuery({
    queryKey: ["tasks", query],
    queryFn: () => api.tasks.get(query).then((r) => r.data),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskManagerApi.CreateTaskDto) =>
      api.tasks.post(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: TaskManagerApi.UpdateTaskDto;
    }) => {
      return api
        .tasks({ id })
        .patch(updates)
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api
        .tasks({ id })
        .delete()
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
// #endregion Task Management Hooks

// #region Column Management Hooks
export function useColumns(query: Parameters<typeof api.columns.get>[0]) {
  return useQuery({
    queryKey: ["columns", query],
    queryFn: () => api.columns.get(query).then((r) => r.data),
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskManagerApi.CreateColumnDto) =>
      api.columns.post(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: TaskManagerApi.UpdateColumnDto;
    }) => {
      return api
        .columns({ id })
        .patch(updates)
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api
        .columns({ id })
        .delete()
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}

// #endregion Column Management Hooks

// #region Category Management Hooks
export function useCategories(query: Parameters<typeof api.categories.get>[0]) {
  return useQuery({
    queryKey: ["categories", query],
    queryFn: () => api.categories.get(query).then((r) => r.data),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskManagerApi.CreateCategoryDto) =>
      api.categories.post(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: TaskManagerApi.UpdateCategoryDto;
    }) => {
      return api
        .categories({ id })
        .patch(updates)
        .then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api
        .categories({ id })
        .delete()
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
// #endregion Category Management Hooks

import type { TaskManagerApi } from "@yag-openapi/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

// #region Task Management Hooks
export function useTasks(query: Parameters<typeof api.tasks.$get>[0]) {
  return useQuery({
    queryKey: ["tasks", query],
    queryFn: () => api.tasks.$get(query).then((r) => r.json()),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskManagerApi.CreateTaskDto) =>
      api.tasks.$post({ json: data }).then((r) => r.json()),
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
    }) =>
      api.tasks[":id"]
        .$patch({ json: updates, param: { id } })
        .then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.tasks[":id"].$delete({ param: { id } }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
// #endregion Task Management Hooks

// #region Column Management Hooks
export function useColumns(query: Parameters<typeof api.columns.$get>[0]) {
  return useQuery({
    queryKey: ["columns", query],
    queryFn: () => api.columns.$get(query).then((r) => r.json()),
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskManagerApi.CreateColumnDto) =>
      api.columns.$post({ json: data }).then((r) => r.json()),
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
    }) =>
      api.columns[":id"]
        .$patch({ json: updates, param: { id } })
        .then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.columns[":id"].$delete({ param: { id } }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["columns"] });
    },
  });
}
// #endregion Column Management Hooks

import type { TaskManagerApi } from '@yag-openapi/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../api/elysia';

export function useTasks(query: Parameters<typeof api.tasks.get>[0]) {
    return useQuery({
        queryKey: ['tasks', query],
        queryFn: () => api.tasks.get(query).then(r => r.data),
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TaskManagerApi.CreateTaskDto) => api.tasks.post(data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: TaskManagerApi.UpdateTaskDto }) => {
            return api.tasks({ id }).patch(updates).then((r) => r.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => api.tasks({ id }).delete().then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

import { TaskManager } from "../../components/task-manager/task-manager";
import {
  useTasks,
  useColumns,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
} from "./lib/task-manager.hooks";

import type { TaskManagerApi } from "@yag-openapi/client";

import type {
  CreateTaskFn,
  UpdateTaskFn,
  DeleteTaskFn,
  CreateColumnFn,
  UpdateColumnFn,
  DeleteColumnFn,
} from "../../types";

import { useState } from "react";

export function ElysiaTaskManager() {
  const [showCode, setShowCode] = useState(false);
  // Fetch data
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ query: {} });
  const { data: columnsData, isLoading: columnsLoading } = useColumns({
    query: {},
  });

  // Handle null/undefined data and type conversion
  const tasks: TaskManagerApi.TaskDto[] = (tasksData ||
    []) as TaskManagerApi.TaskDto[];
  const columns: TaskManagerApi.ColumnDto[] = (columnsData ||
    []) as TaskManagerApi.ColumnDto[];

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const createColumnMutation = useCreateColumn();
  const updateColumnMutation = useUpdateColumn();
  const deleteColumnMutation = useDeleteColumn();

  // Task handlers
  const handleCreateTask: CreateTaskFn = async (data) => {
    const result = await createTaskMutation.mutateAsync(data);
    return result!;
  };

  const handleUpdateTask: UpdateTaskFn = async (id, updates) => {
    const result = await updateTaskMutation.mutateAsync({ id, updates });
    if (!result) {
      throw new Error("Failed to update task");
    }
    return result!;
  };

  const handleDeleteTask: DeleteTaskFn = async (id) => {
    await deleteTaskMutation.mutateAsync(id);
  };

  // Column handlers
  const handleCreateColumn: CreateColumnFn = async (data) => {
    const result = await createColumnMutation.mutateAsync(data);
    return result!;
  };

  const handleUpdateColumn: UpdateColumnFn = async (id, updates) => {
    const result = await updateColumnMutation.mutateAsync({ id, updates });
    if (!result) {
      throw new Error("Failed to update column");
    }
    return result!;
  };

  const handleDeleteColumn: DeleteColumnFn = async (id) => {
    await deleteColumnMutation.mutateAsync(id);
  };

  if (tasksLoading || columnsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Code Examples Section */}
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Elysia Eden Client with TanStack Query</h2>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? 'Hide Code' : 'Show Code Examples'}
          </button>
        </div>
        
        <p className="text-base-content/70 mb-4">
          This demo uses <strong>Elysia Eden Treaty</strong> for type-safe API calls with TanStack Query.
          Eden provides end-to-end type safety from server to client.
        </p>

        {/* Installation Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary">Get Started with Elysia Eden</h3>
              <p className="text-sm text-base-content/70">Install and start building type-safe APIs</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-base-100 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                <span className="font-semibold text-sm">Install Package</span>
              </div>
              <div className="mockup-code bg-base-300 text-sm">
                <pre data-prefix="$"><code>pnpm add @elysiajs/eden</code></pre>
              </div>
            </div>
            
            <div className="bg-base-100 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                <span className="font-semibold text-sm">Read Documentation</span>
              </div>
              <a 
                href="https://elysiajs.com/eden/installation.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                View Official Docs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {showCode && (
          <div className="space-y-4">
            {/* API Client Setup */}
            <div className="mockup-code">
              <pre data-prefix="1"><code className="text-info">// API Client Setup (elysia/lib/api.ts)</code></pre>
              <pre data-prefix="2"><code>import {`{`} treaty {`}`} from '@elysiajs/eden';</code></pre>
              <pre data-prefix="3"><code>import type {`{`} TaskManagerApi {`}`} from '@yag-openapi/client/elysia';</code></pre>
              <pre data-prefix="4"><code></code></pre>
              <pre data-prefix="5"><code className="text-success">export const api = treaty&lt;TaskManagerApi&gt;('http://localhost:3000');</code></pre>
            </div>

            {/* Hook Example */}
            <div className="mockup-code">
              <pre data-prefix="1"><code className="text-info">// TanStack Query Hook (elysia/lib/task-manager.hooks.ts)</code></pre>
              <pre data-prefix="2"><code>export function useTasks(query: Parameters&lt;typeof api.tasks.get&gt;[0]) {`{`}</code></pre>
              <pre data-prefix="3"><code>  return useQuery({`{`}</code></pre>
              <pre data-prefix="4"><code>    queryKey: ["tasks", query],</code></pre>
              <pre data-prefix="5"><code className="text-success">    queryFn: () =&gt; api.tasks.get(query).then((r) =&gt; r.data),</code></pre>
              <pre data-prefix="6"><code>  {`}`});</code></pre>
              <pre data-prefix="7"><code>{`}`}</code></pre>
            </div>

            {/* Mutation Example */}
            <div className="mockup-code">
              <pre data-prefix="1"><code className="text-info">// Create Task Mutation</code></pre>
              <pre data-prefix="2"><code>export function useCreateTask() {`{`}</code></pre>
              <pre data-prefix="3"><code>  const queryClient = useQueryClient();</code></pre>
              <pre data-prefix="4"><code>  return useMutation({`{`}</code></pre>
              <pre data-prefix="5"><code className="text-success">    mutationFn: (data) =&gt; api.tasks.post(data).then((r) =&gt; r.data),</code></pre>
              <pre data-prefix="6"><code>    onSuccess: () =&gt; queryClient.invalidateQueries({`{`} queryKey: ["tasks"] {`}`}),</code></pre>
              <pre data-prefix="7"><code>  {`}`});</code></pre>
              <pre data-prefix="8"><code>{`}`}</code></pre>
            </div>

            {/* Usage Example */}
            <div className="mockup-code">
              <pre data-prefix="1"><code className="text-info">// Component Usage</code></pre>
              <pre data-prefix="2"><code>const {`{`} data: tasks, isLoading {`}`} = useTasks({`{`} query: {`{}`} {`}`});</code></pre>
              <pre data-prefix="3"><code>const createTaskMutation = useCreateTask();</code></pre>
              <pre data-prefix="4"><code></code></pre>
              <pre data-prefix="5"><code className="text-success">// Type-safe API call with automatic invalidation</code></pre>
              <pre data-prefix="6"><code>await createTaskMutation.mutateAsync(newTask);</code></pre>
            </div>

            <div className="alert alert-info">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Elysia Eden Benefits:</strong> End-to-end type safety, automatic serialization, 
                  RPC-like syntax, and excellent TypeScript inference.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Manager Component */}
      <TaskManager
        tasks={tasks}
        columns={columns}
        onCreateTask={handleCreateTask}
        onEditTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onCreateColumn={handleCreateColumn}
        onEditColumn={handleUpdateColumn}
        onDeleteColumn={handleDeleteColumn}
      />
    </div>
  );
}

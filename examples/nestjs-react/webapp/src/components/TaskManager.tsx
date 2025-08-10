import type { FC } from "react";

import {
  useTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
} from "../hooks/hono";

import { useState } from "react";

const TaskForm: FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask.mutate({ title, description });
    setTitle("");
    setDescription("");
  };

  return (
    <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
      <input
        className="input input-bordered"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="input input-bordered"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        className="btn btn-primary"
        type="submit"
        disabled={createTask.isPending}
      >
        Add Task
      </button>
    </form>
  );
};

const TaskList: FC = () => {
  const { data: tasks, isLoading } = useTasks({ query: {} });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  if (isLoading) return <div className="loading loading-spinner" />;
  if (!tasks?.length) return <div className="text-gray-500">No tasks yet.</div>;

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="card bg-base-100 shadow p-4 flex flex-col md:flex-row md:items-center gap-2"
        >
          <div className="flex-1">
            <div className="font-bold flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={task.completed}
                onChange={() =>
                  updateTask.mutate({
                    id: task.id,
                    updates: { completed: !task.completed },
                  })
                }
              />
              <span
                className={task.completed ? "line-through text-gray-400" : ""}
              >
                {task.title}
              </span>
            </div>
            {task.description && (
              <div className="text-sm text-gray-500">{task.description}</div>
            )}
          </div>
          <button
            className="btn btn-error btn-sm"
            onClick={() => deleteTask.mutate(task.id)}
            disabled={deleteTask.isPending}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

export const TaskManager: FC = () => {
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>
      <TaskForm />
      <TaskList />
    </div>
  );
};

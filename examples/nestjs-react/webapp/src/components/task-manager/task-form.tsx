import type { FC } from "react";
import { useState } from "react";
import type { TaskManagerApi } from "@yag-openapi/client";
import type { CreateTaskFn, UpdateTaskFn } from "../../types";

type BaseTaskFormProps = {
  columnId?: number;
  isPending?: boolean;
};

type CreateTaskFormProps = {
  value?: null;
  onSubmit: CreateTaskFn;
}

type UpdateTaskFormProps = {
  value: TaskManagerApi.TaskDto;
  onSubmit: UpdateTaskFn;
}

export type TaskFormProps = BaseTaskFormProps &
  (CreateTaskFormProps | UpdateTaskFormProps);

export const TaskForm: FC<TaskFormProps> = ({
  onSubmit,
  value,
  isPending,
  columnId,
}) => {
  const [title, setTitle] = useState(value?.title || "");
  const [description, setDescription] = useState(value?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (value) {
      onSubmit(value.id, { title, description, columnId });
    } else {
      onSubmit({ title, description, columnId });
    }

    if (!value) {
      setTitle("");
      setDescription("");
    }
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
      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {value ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
};

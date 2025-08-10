import type { FC } from "react";
import { useState } from "react";
import type { TaskManagerApi } from "@yag-openapi/client";

interface SimpleTaskFormProps {
  value?: TaskManagerApi.TaskDto;
  columnId?: number;
  onSubmit: (data: { title: string; description?: string; columnId?: number }) => void;
  isPending?: boolean;
}

export const SimpleTaskForm: FC<SimpleTaskFormProps> = ({
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

    onSubmit({ title, description, columnId });

    if (!value) {
      setTitle("");
      setDescription("");
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="form-control">
        <input
          className="input input-bordered input-sm w-full"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-control">
        <textarea
          className="textarea textarea-bordered textarea-sm w-full h-16 resize-none"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button 
        className="btn btn-primary btn-sm w-full" 
        type="submit" 
        disabled={isPending}
      >
        {isPending && <span className="loading loading-spinner loading-xs"></span>}
        {value ? "Update Task" : "Add Task"}
      </button>
    </form>
  );
};

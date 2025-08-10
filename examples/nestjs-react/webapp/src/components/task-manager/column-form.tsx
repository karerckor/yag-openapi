import type { TaskManagerApi } from "@yag-openapi/client";
import { useState, type FC } from "react";
import type { CreateColumnFn, UpdateColumnFn } from "../../types";

interface CreateColumnFormProps {
  value?: null;
  onSubmit: CreateColumnFn;
  isPending?: boolean;
}

interface UpdateColumnFormProps {
  isPending?: boolean;
  value: TaskManagerApi.ColumnDto;
  onSubmit: UpdateColumnFn;
}

export type ColumnFormProps = CreateColumnFormProps | UpdateColumnFormProps;

export const ColumnForm: FC<ColumnFormProps> = ({
  onSubmit,
  value,
  isPending,
}) => {
  const [name, setName] = useState(value?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (value) {
      onSubmit(value.id, { name });
    } else {
      onSubmit({ name });
    }
    if (!value) {
      setName("");
    }
  };

  return (
    <form className="flex flex-col gap-2 mb-4" onSubmit={handleSubmit}>
      <input
        className="input input-bordered"
        placeholder="Column name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button className="btn btn-primary" type="submit" disabled={isPending}>
        {value ? "Update Column" : "Add Column"}
      </button>
    </form>
  );
};

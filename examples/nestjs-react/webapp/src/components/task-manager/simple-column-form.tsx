import type { TaskManagerApi } from "@yag-openapi/client";
import { useState, type FC } from "react";

interface SimpleColumnFormProps {
  value?: TaskManagerApi.ColumnDto;
  onSubmit: (data: { name: string }) => void;
  isPending?: boolean;
}

export const SimpleColumnForm: FC<SimpleColumnFormProps> = ({
  onSubmit,
  value,
  isPending,
}) => {
  const [name, setName] = useState(value?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({ name });
    
    if (!value) {
      setName("");
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="form-control">
        <input
          className="input input-bordered input-sm w-full"
          placeholder="Column name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <button 
        className="btn btn-primary btn-sm w-full" 
        type="submit" 
        disabled={isPending}
      >
        {isPending && <span className="loading loading-spinner loading-xs"></span>}
        {value ? "Update Column" : "Add Column"}
      </button>
    </form>
  );
};

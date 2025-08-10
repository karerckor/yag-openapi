import { useState, type FC } from "react";
import type { TaskManagerApi } from "@yag-openapi/client";

import { TaskCard } from "./task-card";
import { ColumnForm } from "./column-form";
import type {
  CreateTaskFn,
  DeleteTaskFn,
  UpdateTaskFn,
  DeleteColumnFn,
  UpdateColumnFn,
} from "../../types";
import { TaskForm } from "./task-form";

export const ColumnView: FC<{
  tasks: TaskManagerApi.TaskDto[];
  column: TaskManagerApi.ColumnDto;

  onEditColumn: UpdateColumnFn;
  onDeleteColumn: DeleteColumnFn;

  onEditTask: UpdateTaskFn;
  onDeleteTask: DeleteTaskFn;
  onCreateTask: CreateTaskFn;
}> = ({
  column,
  tasks,
  onDeleteTask,
  onEditTask,
  onCreateTask,
  onDeleteColumn,
  onEditColumn,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div>
      <h2>
        {isEditing ? (
          <ColumnForm value={column} onSubmit={onEditColumn} />
        ) : (
          column.name
        )}

        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Column"}
        </button>

        <button onClick={() => onDeleteColumn(column.id)}>Delete Column</button>
      </h2>
        <button onClick={() => setIsCreating(!isCreating)}>
            {isCreating ? "Cancel" : "Add Task"}
        </button>
        {isCreating ? (
          <TaskForm columnId={column.id} onSubmit={onCreateTask} />
        ) : null}
      <ul>
        {tasks.map((task) => (
          <TaskCard
            task={task}
            key={task.id}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </ul>
    </div>
  );
};

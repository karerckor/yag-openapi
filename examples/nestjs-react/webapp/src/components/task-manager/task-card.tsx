import { useState, type FC } from "react";
import type { TaskManagerApi } from "@yag-openapi/client";

import { SimpleTaskForm } from "./simple-task-form";
import type { DeleteTaskFn, UpdateTaskFn } from "../../types";

export const TaskCard: FC<{
  task: TaskManagerApi.TaskDto;
  onEdit: UpdateTaskFn;
  onDelete: DeleteTaskFn;
}> = ({ task, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleToggleComplete = () => {
    onEdit(task.id, { ...task, completed: !task.completed });
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  if (isEditing) {
    return (
      <SimpleTaskForm 
        value={task}
        onSubmit={(data) => {
          onEdit(task.id, data);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <div className="card bg-base-200 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm flex-shrink-0"
                checked={task.completed}
                onChange={handleToggleComplete}
              />
              <h3 className={`font-semibold text-sm sm:text-base leading-tight truncate ${
                task.completed ? 'line-through text-gray-400' : ''
              }`}>
                {task.title}
              </h3>
            </div>
            {task.description && (
              <p className="text-xs sm:text-sm text-gray-600 ml-6 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button 
              className="btn btn-ghost btn-xs w-8 h-8 p-0 hover:bg-base-300"
              onClick={() => setIsEditing(true)}
              title="Edit task"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              className="btn btn-ghost btn-xs w-8 h-8 p-0 text-error hover:bg-error hover:text-error-content"
              onClick={handleDelete}
              title="Delete task"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import type { FC } from "react";
import { useState } from "react";
import type { TaskManagerApi } from "@yag-openapi/client";

import type {
  CreateColumnFn,
  CreateTaskFn,
  DeleteColumnFn,
  DeleteTaskFn,
  UpdateColumnFn,
  UpdateTaskFn,
} from "../../types";

import { SimpleTaskForm } from "./simple-task-form";
import { TaskCard } from "./task-card";
import { SimpleColumnForm } from "./simple-column-form";

export const TaskManager: FC<{
  tasks: TaskManagerApi.TaskDto[];
  columns: TaskManagerApi.ColumnDto[];

  onEditTask: UpdateTaskFn;
  onDeleteTask: DeleteTaskFn;
  onCreateTask: CreateTaskFn;

  onCreateColumn: CreateColumnFn;
  onEditColumn: UpdateColumnFn;
  onDeleteColumn: DeleteColumnFn;
}> = ({
  tasks,
  columns,
  onEditTask,
  onDeleteTask,
  onCreateTask,
  onCreateColumn,
  onEditColumn,
  onDeleteColumn,
}) => {
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState<TaskManagerApi.ColumnDto | null>(null);

  const handleDeleteColumn = async (id: number) => {
    await onDeleteColumn(id);
  };

  const getTasksForColumn = (columnId: number) => {
    return tasks.filter(task => task.columnId === columnId);
  };

  const getTasksWithoutColumn = () => {
    return tasks.filter(task => !task.columnId);
  };

  return (
    <div className="bg-base-300 min-h-screen">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center lg:text-left">
            Task Manager
          </h1>
          
          {/* Column Management */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Columns</h2>
              <button 
                className="btn btn-outline btn-sm w-full sm:w-auto"
                onClick={() => setShowColumnForm(!showColumnForm)}
              >
                {showColumnForm ? "Cancel" : "Add Column"}
              </button>
            </div>
            
            {showColumnForm && (
              <div className="mb-4 p-4 border rounded-lg bg-base-200 max-w-md">
                <SimpleColumnForm onSubmit={(data) => {
                  onCreateColumn(data);
                  setShowColumnForm(false);
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="my-8">
          <div className="stats stats-vertical sm:stats-horizontal shadow bg-base-100 w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-title">Total Tasks</div>
              <div className="stat-value text-primary">{tasks.length}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-success">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">{tasks.filter(t => t.completed).length}</div>
            </div>
            <div className="stat">
              <div className="stat-figure text-secondary">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-title">Columns</div>
              <div className="stat-value text-secondary">{columns.length}</div>
            </div>
          </div>
        </div>

        {/* Kanban Board Layout */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 lg:gap-6 min-w-max">
            {/* Unassigned Tasks Column */}
            <div className="w-72 sm:w-80 lg:w-96 flex-shrink-0">
              <div className="bg-base-100 rounded-lg shadow-lg h-fit">
                <div className="p-4 border-b border-base-200">
                  <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                    📋 
                    <span className="hidden sm:inline">Unassigned Tasks</span>
                    <span className="sm:hidden">Unassigned</span>
                  </h3>
                </div>
                
                <div className="p-4">
                  {/* Add Task Form for Unassigned */}
                  <div className="mb-4 p-3 bg-base-200 rounded-lg">
                    <SimpleTaskForm 
                      onSubmit={(data) => onCreateTask(data)}
                      columnId={undefined}
                    />
                  </div>
                  
                  {/* Unassigned Tasks */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getTasksWithoutColumn().map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                    {getTasksWithoutColumn().length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-gray-500 text-sm">No unassigned tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Column-based Tasks */}
            {columns.map(column => (
              <div key={column.id} className="w-72 sm:w-80 lg:w-96 flex-shrink-0">
                <div className="bg-base-100 rounded-lg shadow-lg h-fit">
                  {/* Column Header */}
                  <div className="p-4 border-b border-base-200">
                    {editingColumn?.id === column.id ? (
                      <SimpleColumnForm 
                        value={column}
                        onSubmit={(data) => {
                          onEditColumn(column.id, data);
                          setEditingColumn(null);
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold truncate flex-1 mr-2">
                          {column.name}
                        </h3>
                        <div className="dropdown dropdown-end">
                          <label tabIndex={0} className="btn btn-ghost btn-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </label>
                          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                            <li>
                              <button onClick={() => setEditingColumn(column)} className="text-left">
                                ✏️ Edit Column
                              </button>
                            </li>
                            <li>
                              <button 
                                onClick={() => handleDeleteColumn(column.id)}
                                className="text-error text-left"
                              >
                                🗑️ Delete Column
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {editingColumn?.id !== column.id && (
                    <div className="p-4">
                      {/* Add Task Form for Column */}
                      <div className="mb-4 p-3 bg-base-200 rounded-lg">
                        <SimpleTaskForm 
                          onSubmit={(data) => onCreateTask(data)}
                          columnId={column.id}
                        />
                      </div>
                      
                      {/* Column Tasks */}
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {getTasksForColumn(column.id).map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                          />
                        ))}
                        {getTasksForColumn(column.id).length === 0 && (
                          <div className="text-center py-8">
                            <div className="text-4xl mb-2">📂</div>
                            <p className="text-gray-500 text-sm">No tasks in this column</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty state when no columns */}
            {columns.length === 0 && (
              <div className="w-72 sm:w-80 lg:w-96 flex-shrink-0">
                <div className="bg-base-100 rounded-lg shadow-lg p-8 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold mb-2">No columns yet</h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    Create your first column to organize tasks!
                  </p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowColumnForm(true)}
                  >
                    Create First Column
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

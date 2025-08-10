import type { FC } from "react";
import { Link, Outlet, useLocation } from "react-router";

export { PetsStore as ElysiaPetsStore } from './pets-store'
export { ElysiaTaskManager } from './task-manager'

export const ElysiaIndex: FC = () => {
  const location = useLocation();
  const isIndexPage = location.pathname === '/elysia';

  return (
    <div className="min-h-screen">
      {/* Sub-navigation */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-primary">Elysia Eden Client Demo</h2>
            <div className="flex gap-2">
              <Link 
                className="btn btn-primary btn-sm"
                to="/elysia/tasks"
              >
                Task Manager Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isIndexPage ? (
        <div className="container mx-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-primary">Elysia Eden Client</h1>
              <p className="text-lg text-base-content/70">
                Experience end-to-end type safety with RPC-like syntax and automatic serialization
              </p>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-primary">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Task Manager Demo
                </h2>
                <p className="mb-4">
                  Explore a fully-featured Kanban board with <strong>live code examples</strong> showing 
                  Elysia Eden Treaty integration with TanStack Query.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Type-safe API calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>RPC-like syntax</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Code examples</span>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <Link to="/elysia/tasks" className="btn btn-primary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    View Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

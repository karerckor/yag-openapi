import type { FC } from "react";
import { Link, Outlet, useLocation } from "react-router";

export const Index: FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-base-300">
      {/* Navigation Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl font-bold">
            @yag-openapi demos
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-6">
            <li>
              <Link 
                to="/elysia/tasks" 
                className={`btn btn-ghost ${location.pathname.includes('/elysia') ? 'btn-active' : ''}`}
              >
                Elysia Demo
              </Link>
            </li>
            <li>
              <Link 
                to="/hono/tasks" 
                className={`btn btn-ghost ${location.pathname.includes('/hono') ? 'btn-active' : ''}`}
              >
                Hono Demo
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end lg:hidden">
            <label tabIndex={0} className="btn btn-ghost">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link to="/elysia/tasks">Elysia Demo</Link></li>
              <li><Link to="/hono/tasks">Hono Demo</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={isHomePage ? "container mx-auto p-8" : ""}>
        {isHomePage ? (
          <div className="space-y-12">
            <div className="hero min-h-[60vh]">
              <div className="hero-content text-center">
                <div className="max-w-4xl">
                  <h1 className="text-5xl font-bold mb-8">Task Manager Demos</h1>
                  <p className="text-lg mb-8">
                    Compare Elysia Eden and Hono client implementations with TanStack Query
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="card bg-base-100 shadow-xl">
                      <div className="card-body">
                        <h2 className="card-title">
                          <span className="badge badge-primary">Elysia Eden</span>
                        </h2>
                        <p>End-to-end type safety with RPC-like syntax</p>
                        <div className="text-sm text-base-content/70 space-y-1">
                          <div>✨ Automatic type inference</div>
                          <div>🚀 Treaty client pattern</div>
                          <div>📝 Built-in serialization</div>
                        </div>
                        <div className="card-actions justify-end">
                          <Link to="/elysia/tasks" className="btn btn-primary">
                            View Demo + Code
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="card bg-base-100 shadow-xl">
                      <div className="card-body">
                        <h2 className="card-title">
                          <span className="badge badge-secondary">Hono Client</span>
                        </h2>
                        <p>Lightweight, fast HTTP client with explicit control</p>
                        <div className="text-sm text-base-content/70 space-y-1">
                          <div>⚡ Minimal bundle size</div>
                          <div>🎯 Explicit JSON handling</div>
                          <div>🔧 Flexible routing patterns</div>
                        </div>
                        <div className="card-actions justify-end">
                          <Link to="/hono/tasks" className="btn btn-secondary">
                            View Demo + Code
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Section */}
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Client Comparison</h2>
                <p className="text-lg text-base-content/70">See the differences in API client patterns</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="card bg-primary/5 border border-primary/20">
                  <div className="card-body">
                    <h3 className="card-title text-primary">Elysia Eden Treaty</h3>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="bg-primary/10 px-2 py-1 rounded text-xs">pnpm add @elysiajs/eden</code>
                        <a 
                          href="https://elysiajs.com/eden/installation.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-xs"
                        >
                          Docs
                        </a>
                      </div>
                    </div>
                    <div className="mockup-code text-sm">
                      <pre data-prefix="$"><code>api.tasks.get(query).then(r =&gt; r.data)</code></pre>
                      <pre data-prefix="$"><code>api.tasks.post(data).then(r =&gt; r.data)</code></pre>
                      <pre data-prefix="$"><code>api.tasks({`{id}`}).patch(updates)</code></pre>
                    </div>
                    <p className="text-sm mt-2">RPC-style syntax with automatic type safety</p>
                  </div>
                </div>
                
                <div className="card bg-secondary/5 border border-secondary/20">
                  <div className="card-body">
                    <h3 className="card-title text-secondary">Hono Client</h3>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="bg-secondary/10 px-2 py-1 rounded text-xs">pnpm add -D hono</code>
                        <a 
                          href="https://hono.dev/docs/concepts/stacks#client" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-xs"
                        >
                          Docs
                        </a>
                      </div>
                    </div>
                    <div className="mockup-code text-sm">
                      <pre data-prefix="$"><code>api.tasks.$get(query).then(r =&gt; r.json())</code></pre>
                      <pre data-prefix="$"><code>api.tasks.$post({`{json: data}`}).then(r =&gt; r.json())</code></pre>
                      <pre data-prefix="$"><code>api.tasks[":id"].$patch({`{json, param}`})</code></pre>
                    </div>
                    <p className="text-sm mt-2">REST-style with explicit JSON handling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

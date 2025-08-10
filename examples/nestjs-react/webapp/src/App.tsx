import { Index } from "./routes";
import { HonoIndex, HonoPetsStore, HonoTaskManager } from "./routes/hono";
import {
  ElysiaIndex,
  ElysiaPetsStore,
  ElysiaTaskManager,
} from "./routes/elysia";

import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    children: [
      {
        path: "/elysia",
        element: <ElysiaIndex />,
        children: [
          {
            path: "/elysia/tasks",
            element: <ElysiaTaskManager />,
          },
          {
            path: "/elysia/pets-store",
            element: <ElysiaPetsStore />,
          },
        ],
      },
      {
        path: "/hono",
        element: <HonoIndex />,
        children: [
          {
            path: "/hono/tasks",
            element: <HonoTaskManager />,
          },
          {
            path: "/hono/pets-store",
            element: <HonoPetsStore />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Login from "./pages/Login";
import "./index.css";
import App from './App.jsx'
import ObjectDetection from './pages/ObjectDetection.jsx';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/projects", element: <Projects /> },
      { path: "/projects/:slug", element: <ProjectDetail /> },
      { path: "/projects/object-detection", element: <ObjectDetection /> }, // 👈 new

      { path: "/login", element: <Login /> },
    ],
  },
]);



createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
  // <StrictMode>
  // </StrictMode>,
)










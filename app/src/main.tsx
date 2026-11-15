import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { createStore } from "@/app/store";
import { router } from "@/app/router";
import "@/styles/global.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    <Provider store={createStore()}>
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
    </Provider>
  </StrictMode>,
);

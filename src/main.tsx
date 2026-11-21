import { motionTokens } from "./variants/motion-tokens";
import { initializeDensity } from "./baseline/density";
import React from "react";
import { MotionConfig } from "motion/react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "next-themes";
import { TooltipProvider } from "./primitives/tooltip";
import { Toaster } from "./primitives/sonner";
import App from "./App";
import "./styles.css";
initializeDensity();

function ApplicationToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      storageKey="rams-theme"
    >
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={motionTokens.keyframes.tooltip.directOpenDelayMs}>
          <App />
          <ApplicationToaster />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  </React.StrictMode>,
);

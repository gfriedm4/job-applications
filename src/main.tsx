import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/main.css";

const GOOGLE_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Sora:wght@400;500;600;700&display=swap";

const loadFontsDeferred = () => {
  if (document.querySelector('link[data-app-fonts="true"]')) {
    return;
  }

  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://fonts.gstatic.com";
  preconnect.crossOrigin = "anonymous";
  document.head.append(preconnect);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = GOOGLE_FONT_STYLESHEET;
  link.media = "print";
  link.dataset.appFonts = "true";
  link.addEventListener(
    "load",
    () => {
      link.media = "all";
    },
    { once: true }
  );
  document.head.append(link);
};

if (typeof window.requestIdleCallback === "function") {
  window.requestIdleCallback(loadFontsDeferred, { timeout: 1200 });
} else {
  window.setTimeout(loadFontsDeferred, 1);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-blocking registration failure.
    });
  });
}

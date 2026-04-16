import React from "react";
import ReactDOM from "react-dom/client";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

const nonceMeta =
  document.querySelector('meta[property="csp-nonce"]') ||
  document.querySelector('meta[name="csp-nonce"]');
const cspNonce =
  nonceMeta?.getAttribute("nonce") || nonceMeta?.getAttribute("content");

const emotionCache = createCache({ key: "mui", nonce: cspNonce || undefined });

root.render(
  <React.StrictMode>
    <CacheProvider value={emotionCache}>
      <App />
    </CacheProvider>
  </React.StrictMode>,
);

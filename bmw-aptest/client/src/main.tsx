import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProviderWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProviderWrapper>
  </React.StrictMode>
);

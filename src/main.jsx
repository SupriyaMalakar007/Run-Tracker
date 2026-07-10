import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import App from "./App";
import "./index.css";

import { RunProvider } from "./Context/RunContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RunProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RunProvider>
  </React.StrictMode>
);
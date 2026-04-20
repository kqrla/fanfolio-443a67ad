// Initialise the backend adapter FIRST so that legacy modules using
//   const db = globalThis.__B44_DB__ || { ...stub }
// pick up the real Supabase-backed adapter at module-evaluation time.
import "@/api/base44Client";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

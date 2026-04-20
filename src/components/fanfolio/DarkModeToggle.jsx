import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

function getStored() {
  try { return localStorage.getItem("fanfolio-dark") === "1"; } catch { return false; }
}

function applyDark(dark) {
  document.documentElement.classList.toggle("dark", dark);
  try { localStorage.setItem("fanfolio-dark", dark ? "1" : "0"); } catch {}
}

export default function DarkModeToggle({ className = "" }) {
  const [dark, setDark] = useState(getStored);

  useEffect(() => { applyDark(dark); }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="toggle dark mode"
      className={`w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-colors ${className}`}
    >
      {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
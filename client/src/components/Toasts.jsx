import React from "react";
import { useStore } from "../context/StoreContext.jsx";

const ICONS = { success: "✓", info: "i", error: "!" };

export default function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="t-icon">{ICONS[t.type] || "✓"}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

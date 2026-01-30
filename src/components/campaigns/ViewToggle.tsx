"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ViewMode = "table" | "kanban";

interface ViewToggleProps {
  currentView: ViewMode;
}

export default function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (view: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center gap-1 bg-[var(--bg)] border border-app rounded-xl p-1">
      <button
        onClick={() => handleChange("table")}
        className={`px-4 py-1.5 text-sm font-medium rounded-xl transition-all ${
          currentView === "table"
            ? "bg-card text-accent shadow-app"
            : "text-muted hover:text-[var(--text)]"
        }`}
      >
        Table
      </button>
      <button
        onClick={() => handleChange("kanban")}
        className={`px-4 py-1.5 text-sm font-medium rounded-xl transition-all ${
          currentView === "kanban"
            ? "bg-card text-accent shadow-app"
            : "text-muted hover:text-[var(--text)]"
        }`}
      >
        Kanban
      </button>
    </div>
  );
}


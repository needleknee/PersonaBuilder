// Dev-only preview: renders the card from fixtures so it can be built without
// the input page or the AI engine. Mount it anywhere, e.g. in App.tsx:
//   import { PersonaCardPreview } from "./components/PersonaCard/PersonaCardPreview";
import { useState } from "react";
import { PersonaCard } from "./PersonaCard";
import type { PersonaResult } from "./types";
import sparse from "./__fixtures__/sparse-result.json";
import conflicting from "./__fixtures__/conflicting-result.json";

type Mode = "sparse" | "conflicting" | "loading" | "error" | "empty";

const FIXTURES: Record<string, PersonaResult> = {
  sparse: sparse as PersonaResult,
  conflicting: conflicting as PersonaResult,
};

export function PersonaCardPreview() {
  const [mode, setMode] = useState<Mode>("sparse");
  const modes: Mode[] = ["sparse", "conflicting", "loading", "error", "empty"];

  return (
    <div style={{ padding: 24, background: "#f0ece4", minHeight: "100vh" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {modes.map((m) => (
          <button key={m} className="pc-button" aria-pressed={mode === m} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>
      <PersonaCard
        result={FIXTURES[mode] ?? null}
        loading={mode === "loading"}
        error={mode === "error" ? "The AI service did not respond within 30 seconds." : null}
        onRetry={() => setMode("sparse")}
      />
    </div>
  );
}

export default PersonaCardPreview;

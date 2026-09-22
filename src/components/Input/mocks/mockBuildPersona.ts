import type { SampleId } from "../sampleInputs";
import type { PersonaResult } from "../types";
import { conflictingMockResult, genericMockResult, richMockResult, sparseMockResult } from "./fixtures";

// Dev-only deterministic failure trigger, so Person 2 can build/test the
// error state without relying on flaky/random rejection during a demo.
const ERROR_TRIGGER = "force error";

const MOCK_DELAY_MS = 1200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Matches Person 3's frozen buildPersona(rawInput: string): Promise<PersonaResult>
// signature; the optional sampleId is additive so Home can pick a matching
// fixture, and is simply dropped when this call is swapped for the real
// src/agent/buildPersona during Phase 3 integration.
export async function mockBuildPersona(
  rawInput: string,
  sampleId?: SampleId | null,
): Promise<PersonaResult> {
  await delay(MOCK_DELAY_MS);

  if (rawInput.trim().toLowerCase() === ERROR_TRIGGER) {
    throw new Error("Mock persona generation failed. Please try again.");
  }

  switch (sampleId) {
    case "sparse":
      return clone(sparseMockResult);
    case "rich":
      return clone(richMockResult);
    case "conflicting":
      return clone(conflictingMockResult);
    default:
      return clone(genericMockResult);
  }
}

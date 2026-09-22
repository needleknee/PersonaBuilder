# Marketing Analysis Layer

This folder provides reusable analysis utilities for a generated `PersonaResult`.

## Available utilities

- `attachVerifiedEvidence(rawInput, result)`
  - Checks whether stated evidence quotes occur in the raw notes.
  - Downgrades unsupported stated claims to low-confidence inferences.

- `scoreConfidence(field)`
  - Returns `high`, `medium`, or `low` using deterministic rules.

- `detectGaps(result)`
  - Returns required persona fields missing from the notes.

- `detectConflicts(result)`
  - Preserves competing claims marked as `conflicting`.

## Integration

Import from the folder entry point:

```ts
import {
  attachVerifiedEvidence,
  detectConflicts,
  detectGaps,
  scoreConfidence,
} from "../analysis";

## Suggested processing order
const evidenceChecked = attachVerifiedEvidence(rawInput, personaResult);

const result = {
  ...evidenceChecked,
  gaps: detectGaps(evidenceChecked),
  conflicts: detectConflicts(evidenceChecked),
};

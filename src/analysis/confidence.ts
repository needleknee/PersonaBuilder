import type { Field } from "./types";

export function scoreConfidence(
  field: Field
): "high" | "medium" | "low" {
  if (
    field.status === "missing" ||
    field.status === "conflicting"
  ) {
    return "low";
  }

  if (
    field.status === "stated" &&
    field.evidence &&
    field.evidence.length > 0
  ) {
    return "high";
  }

  if (
    field.status === "inferred" &&
    field.reasoning &&
    field.reasoning.trim().length > 0
  ) {
    return "medium";
  }

  return "low";
}

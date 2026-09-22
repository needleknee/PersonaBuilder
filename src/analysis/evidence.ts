import type {
  Evidence,
  Field,
  PersonaResult,
} from "./types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"'.,!?;:()[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function evidenceExists(
  rawInput: string,
  evidence: Evidence
): boolean {
  return normalize(rawInput).includes(
    normalize(evidence.quote)
  );
}

export function validateFieldEvidence(
  rawInput: string,
  field: Field
): Field {
  const verifiedEvidence = (field.evidence ?? []).filter(
    (evidence) => evidenceExists(rawInput, evidence)
  );

  if (field.status === "stated" && verifiedEvidence.length === 0) {
    return {
      ...field,
      status: "inferred",
      confidence: "low",
      evidence: [],
      reasoning:
        field.reasoning ??
        "This claim was marked as stated, but no matching evidence was found in the notes.",
    };
  }

  return {
    ...field,
    evidence: verifiedEvidence,
  };
}

export function attachVerifiedEvidence(
  rawInput: string,
  result: PersonaResult
): PersonaResult {
  const verify = (fields: Field[]) =>
    fields.map((field) =>
      validateFieldEvidence(rawInput, field)
    );

  return {
    ...result,
    persona: Object.fromEntries(
      Object.entries(result.persona).map(([key, fields]) => [
        key,
        verify(fields),
      ])
    ) as PersonaResult["persona"],

    messaging: Object.fromEntries(
      Object.entries(result.messaging).map(([key, fields]) => [
        key,
        verify(fields),
      ])
    ) as PersonaResult["messaging"],

    buyingCommittee: result.buyingCommittee
      ? verify(result.buyingCommittee)
      : undefined,

    funnelStage: result.funnelStage
      ? verify(result.funnelStage)
      : undefined,
  };
}

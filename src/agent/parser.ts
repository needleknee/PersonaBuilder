import {
  PersonaResultSchema,
  type PersonaResult,
} from "../schema/personaSchema";

type Field = PersonaResult["persona"]["jobTitle"][number];

const PERSONA_FIELDS = [
  "jobTitle",
  "department",
  "companyType",
  "companySize",
  "goals",
  "challenges",
  "successMetrics",
  "buyingTriggers",
  "purchaseObjections",
  "decisionMakingRole",
  "preferredChannels",
] as const;

const MESSAGING_FIELDS = [
  "valueProposition",
  "keyMessages",
  "proofPoints",
  "contentIdeas",
  "callToAction",
] as const;

export function parseExtractedResponse(
  rawResponse: string
): PersonaResult {
  const parsed = JSON.parse(extractJson(rawResponse)) as Record<
    string,
    unknown
  >;

  return PersonaResultSchema.parse(normalizeResponse(parsed));
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in the model response.");
  }

  return text.slice(firstBrace, lastBrace + 1);
}

function normalizeResponse(raw: Record<string, unknown>) {
  const rawPersona = asRecord(raw.persona);
  const rawMessaging = asRecord(raw.messaging);

  const persona = Object.fromEntries(
    PERSONA_FIELDS.map((field) => [
      field,
      normalizeFields(rawPersona[field]),
    ])
  );

  const messaging = Object.fromEntries(
    MESSAGING_FIELDS.map((field) => [
      field,
      normalizeFields(rawMessaging[field]),
    ])
  );

  return {
    persona,
    messaging,
    buyingCommittee: normalizeFields(raw.buyingCommittee),
    funnelStage: normalizeFields(raw.funnelStage),
    gaps: normalizeGaps(raw.gaps),
    conflicts: normalizeConflicts(raw.conflicts),
    summary: typeof raw.summary === "string" ? raw.summary.trim() : "",
  };
}

function normalizeFields(value: unknown): Field[] {
  const items = Array.isArray(value) ? value : value ? [value] : [];

  if (items.length === 0) {
    return [missingField()];
  }

  const normalized = items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map(normalizeField);

  return normalized.length > 0 ? normalized : [missingField()];
}

function normalizeField(raw: Record<string, unknown>): Field {
  const status = normalizeStatus(raw.status);
  const value = typeof raw.value === "string" ? raw.value.trim() : "";
  const confidence = normalizeConfidence(raw.confidence);
  const reasoning =
    typeof raw.reasoning === "string" ? raw.reasoning.trim() : "";

  if (status === "missing") {
    return missingField();
  }

  if (status === "stated") {
    const evidence = normalizeEvidence(raw.evidence);

    if (evidence.length === 0) {
      return {
        value,
        status: "inferred",
        confidence: "low",
        reasoning:
          "The model marked this as stated but did not provide a supporting quote.",
      };
    }

    return {
      value,
      status: "stated",
      confidence,
      evidence,
    };
  }

  if (status === "inferred") {
    if (!value || !reasoning) {
      return missingField();
    }

    return {
      value,
      status: "inferred",
      confidence,
      reasoning,
    };
  }

  return {
    value,
    status: "conflicting",
    confidence: "low",
  };
}

function missingField(): Field {
  return {
    value: "",
    status: "missing",
    confidence: "low",
  };
}

function normalizeStatus(
  value: unknown
): Field["status"] {
  if (
    value === "stated" ||
    value === "inferred" ||
    value === "missing" ||
    value === "conflicting"
  ) {
    return value;
  }

  return "missing";
}

function normalizeConfidence(
  value: unknown
): Field["confidence"] {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return "low";
}

function normalizeEvidence(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const quote =
      typeof record.quote === "string" ? record.quote.trim() : "";
    const source =
      typeof record.source === "string" ? record.source.trim() : "input";

    return quote ? [{ quote, source }] : [];
  });
}

function normalizeGaps(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const field =
      typeof record.field === "string" ? record.field.trim() : "";
    const reason =
      typeof record.reason === "string"
        ? record.reason.trim()
        : "Not present in the provided notes.";

    return field ? [{ field, reason }] : [];
  });
}

function normalizeConflicts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const field =
      typeof record.field === "string" ? record.field.trim() : "";

    const competingClaims = Array.isArray(record.competingClaims)
      ? record.competingClaims.flatMap((claim) => {
          if (!claim || typeof claim !== "object") {
            return [];
          }

          const item = claim as Record<string, unknown>;
          const value =
            typeof item.value === "string" ? item.value.trim() : "";
          const source =
            typeof item.source === "string"
              ? item.source.trim()
              : "input";

          return value ? [{ value, source }] : [];
        })
      : [];

    return field && competingClaims.length >= 2
      ? [{ field, competingClaims }]
      : [];
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

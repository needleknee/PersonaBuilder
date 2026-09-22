/**
 * JSON Parser and Response Normalization
 * 
 * Handles LLM response parsing, cleanup, and schema validation.
 * Resilient to common LLM failure modes:
 * - JSON wrapped in markdown code fences
 * - Extra commentary before/after JSON
 * - Partial JSON responses
 * - Missing or null fields
 * - Wrong data types
 */

import { RawExtractionResponse, PersonaResult, PersonaFieldItem, Confidence } from "../types/persona";

/**
 * Parse LLM response and convert to structured PersonaResult
 * @param rawResponse Raw string from LLM
 * @returns Normalized PersonaResult
 */
export function parseExtractedResponse(rawResponse: string): PersonaResult {
  try {
    // Step 1: Extract JSON from response (handle markdown, commentary, etc.)
    const jsonString = extractJSON(rawResponse);

    // Step 2: Parse JSON
    const parsed = JSON.parse(jsonString) as RawExtractionResponse;

    // Step 3: Normalize to schema
    const normalized = normalizeResponse(parsed);

    return normalized;
  } catch (error) {
    console.error("Failed to parse extraction response:", error);
    throw new Error(
      `Failed to parse LLM response as valid persona JSON. Original error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Extract JSON from response that may contain markdown, commentary, etc.
 * Handles:
 * - ```json ... ``` code fences
 * - ```json ... ` trailing backtick only
 * - ```  ``` with other language identifiers
 * - Multiple JSON objects (takes first)
 * - Text before and after JSON
 */
function extractJSON(text: string): string {
  // Try markdown code fence first
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (markdownMatch && markdownMatch[1]) {
    const candidate = markdownMatch[1].trim();
    if (isValidJSON(candidate)) {
      return candidate;
    }
  }

  // Try finding JSON object by braces
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let startIdx = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        if (braceCount === 0) {
          startIdx = i;
        }
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0 && startIdx >= 0) {
          const candidate = text.substring(startIdx, i + 1);
          if (isValidJSON(candidate)) {
            return candidate;
          }
        }
      }
    }
  }

  throw new Error("No valid JSON found in response");
}

/**
 * Check if string is valid JSON
 */
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize raw extraction response to PersonaResult schema
 */
function normalizeResponse(raw: RawExtractionResponse): PersonaResult {
  return {
    persona: {
      profile: normalizeSection(raw.persona?.profile || {}, [
        "archetype",
        "jobTitle",
        "department",
        "companyType",
        "companySize",
        "decisionMakingRole",
      ]),
      context: normalizeSection(raw.persona?.context || {}, [
        "goals",
        "challenges",
        "successMetrics",
        "currentSituation",
        "priorityDrivers",
      ]),
      buyingBehavior: normalizeSection(raw.persona?.buyingBehavior || {}, [
        "buyingTriggers",
        "purchaseObjections",
        "buyingCycle",
        "decisionCriteria",
        "preferredChannels",
        "informationSources",
      ]),
    },
    messaging: normalizeSection(raw.messaging || {}, [
      "valueProposition",
      "keyMessages",
      "proofPoints",
      "contentIdeas",
      "callToAction",
      "toneAndStyle",
      "messagesToAvoid",
    ]),
    gaps: normalizeGaps(raw.gaps),
    conflicts: normalizeConflicts(raw.conflicts),
    summary: normalizeSummary(raw.summary),
    extractedAt: new Date().toISOString(),
    confidence: normalizeConfidence(raw),
  };
}

/**
 * Normalize a section (profile, context, messaging, etc.)
 */
function normalizeSection(
  section: Record<string, unknown>,
  expectedFields: string[]
): Record<string, PersonaFieldItem[]> {
  const result: Record<string, PersonaFieldItem[]> = {};

  for (const field of expectedFields) {
    const value = section[field];

    if (Array.isArray(value)) {
      result[field] = value
        .filter((item) => item && typeof item === "object")
        .map((item) => normalizeFieldItem(item as Record<string, unknown>));
    } else if (value && typeof value === "object") {
      result[field] = [normalizeFieldItem(value as Record<string, unknown>)];
    } else {
      // Missing field - create placeholder
      result[field] = [
        {
          value: "Not specified in input",
          status: "missing",
          confidence: "high",
        },
      ];
    }

    // Ensure at least one item per field
    if (result[field].length === 0) {
      result[field] = [
        {
          value: "Not specified in input",
          status: "missing",
          confidence: "high",
        },
      ];
    }
  }

  return result;
}

/**
 * Normalize a single field item
 */
function normalizeFieldItem(
  item: Record<string, unknown>
): PersonaFieldItem {
  const value = String(item.value || "");
  const status = normalizeStatus(item.status);
  const confidence = normalizeConfidence(item);

  const normalized: PersonaFieldItem = {
    value: value.trim(),
    status,
    confidence,
  };

  // Add evidence if present and relevant
  if (Array.isArray(item.evidence) && item.evidence.length > 0 && status === "stated") {
    normalized.evidence = item.evidence
      .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
      .map((e) => ({
        quote: String(e.quote || "").trim(),
        source: e.source ? String(e.source) : "input",
      }))
      .filter((e) => e.quote.length > 0);
  }

  // Add reasoning if present and relevant
  if (typeof item.reasoning === "string" && item.reasoning.trim() && status === "inferred") {
    normalized.reasoning = item.reasoning.trim();
  }

  return normalized;
}

/**
 * Normalize status field to valid enum
 */
function normalizeStatus(value: unknown): "stated" | "inferred" | "missing" | "conflicting" {
  const str = String(value).toLowerCase().trim();
  const validStatuses = ["stated", "inferred", "missing", "conflicting"];

  if (validStatuses.includes(str)) {
    return str as "stated" | "inferred" | "missing" | "conflicting";
  }

  return "missing"; // Default to missing if unrecognized
}

/**
 * Normalize confidence field
 */
function normalizeConfidence(
  value: unknown
): Confidence {
  if (typeof value === "object" && value !== null && "confidence" in value) {
    const conf = String((value as Record<string, unknown>).confidence).toLowerCase().trim();
    if (["high", "medium", "low"].includes(conf)) {
      return conf as Confidence;
    }
  }

  const str = String(value).toLowerCase().trim();
  if (["high", "medium", "low"].includes(str)) {
    return str as Confidence;
  }

  return "medium"; // Default
}

/**
 * Normalize gaps array
 */
function normalizeGaps(
  gaps: unknown
): Array<{ field: string; reason: string }> {
  if (!Array.isArray(gaps)) {
    return [];
  }

  return gaps
    .filter((gap): gap is Record<string, unknown> => typeof gap === "object" && gap !== null)
    .map((gap) => ({
      field: String(gap.field || "unknown"),
      reason: String(gap.reason || "Information not provided in input"),
    }))
    .filter((gap) => gap.field.length > 0);
}

/**
 * Normalize conflicts array
 */
function normalizeConflicts(
  conflicts: unknown
): Array<{
  field: string;
  competingClaims: Array<{
    value: string;
    source?: string;
    evidence?: Array<{ quote: string; source?: string }>;
  }>;
}> {
  if (!Array.isArray(conflicts)) {
    return [];
  }

  return conflicts
    .filter((conf): conf is Record<string, unknown> => typeof conf === "object" && conf !== null)
    .map((conf) => {
      const competingClaims = Array.isArray(conf.competingClaims)
        ? conf.competingClaims
            .filter((claim): claim is Record<string, unknown> => typeof claim === "object" && claim !== null)
            .map((claim) => ({
              value: String(claim.value || ""),
              source: claim.source ? String(claim.source) : undefined,
              evidence: Array.isArray(claim.evidence)
                ? claim.evidence
                    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
                    .map((e) => ({
                      quote: String(e.quote || ""),
                      source: e.source ? String(e.source) : undefined,
                    }))
                    .filter((e) => e.quote.length > 0)
                : undefined,
            }))
            .filter((claim) => claim.value.length > 0)
        : [];

      return {
        field: String(conf.field || "unknown"),
        competingClaims,
      };
    })
    .filter((conf) => conf.field.length > 0 && conf.competingClaims.length > 0);
}

/**
 * Normalize summary text
 */
function normalizeSummary(summary: unknown): string {
  if (typeof summary === "string") {
    return summary.trim().slice(0, 1000); // Cap at 1000 chars
  }
  return "";
}

/**
 * Calculate confidence percentages
 */
function normalizeConfidenceMetrics(raw: RawExtractionResponse): {
  overall: Confidence;
  statedPercentage: number;
  inferredPercentage: number;
  missingPercentage: number;
} {
  // If provided, use them
  if (raw.confidence && typeof raw.confidence === "object") {
    const conf = raw.confidence as Record<string, unknown>;
    const overall = normalizeConfidence(conf.overall || "medium");
    const stated = Number(conf.statedPercentage) || 0;
    const inferred = Number(conf.inferredPercentage) || 0;
    const missing = Number(conf.missingPercentage) || 0;

    // Validate percentages
    const total = stated + inferred + missing;
    if (total === 100 && stated >= 0 && inferred >= 0 && missing >= 0) {
      return { overall, statedPercentage: stated, inferredPercentage: inferred, missingPercentage: missing };
    }
  }

  // Calculate from persona items
  let statedCount = 0;
  let inferredCount = 0;
  let missingCount = 0;
  let total = 0;

  const countField = (field: unknown) => {
    if (Array.isArray(field)) {
      for (const item of field) {
        if (item && typeof item === "object") {
          const status = (item as Record<string, unknown>).status;
          if (status === "stated") statedCount++;
          else if (status === "inferred") inferredCount++;
          else if (status === "missing") missingCount++;
          total++;
        }
      }
    }
  };

  // Count all persona fields
  if (raw.persona?.profile) {
    for (const field of Object.values(raw.persona.profile)) {
      countField(field);
    }
  }
  if (raw.persona?.context) {
    for (const field of Object.values(raw.persona.context)) {
      countField(field);
    }
  }
  if (raw.persona?.buyingBehavior) {
    for (const field of Object.values(raw.persona.buyingBehavior)) {
      countField(field);
    }
  }

  if (total === 0) {
    return {
      overall: "medium",
      statedPercentage: 33,
      inferredPercentage: 33,
      missingPercentage: 34,
    };
  }

  const statedPercentage = Math.round((statedCount / total) * 100);
  const inferredPercentage = Math.round((inferredCount / total) * 100);
  const missingPercentage = 100 - statedPercentage - inferredPercentage;

  // Determine overall confidence
  let overall: Confidence = "medium";
  if (statedPercentage >= 60) {
    overall = "high";
  } else if (statedPercentage <= 20) {
    overall = "low";
  }

  return { overall, statedPercentage, inferredPercentage, missingPercentage };
}

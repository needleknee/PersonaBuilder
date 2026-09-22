import type { Gap, PersonaResult } from "./types";

const REQUIRED_FIELDS: Array<keyof PersonaResult["persona"]> = [
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
];

export function detectGaps(result: PersonaResult): Gap[] {
  return REQUIRED_FIELDS.flatMap((field) => {
    const fields = result.persona[field];

    const hasValue = fields.some(
      (item) =>
        item.status !== "missing" &&
        item.value.trim().length > 0
    );

    if (hasValue) {
      return [];
    }

    return [
      {
        field,
        reason: "Not present in the provided notes.",
      },
    ];
  });
}

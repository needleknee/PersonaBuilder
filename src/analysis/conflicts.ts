import type {
  Conflict,
  Field,
  PersonaResult,
} from "./types";

function createConflict(
  fieldName: string,
  fields: Field[]
): Conflict[] {
  const conflictingFields = fields.filter(
    (field) => field.status === "conflicting"
  );

  if (conflictingFields.length < 2) {
    return [];
  }

  return [
    {
      field: fieldName,
      competingClaims: conflictingFields.map((field) => ({
        value: field.value,
        source: field.evidence?.[0]?.source ?? "Unknown source",
      })),
    },
  ];
}

export function detectConflicts(
  result: PersonaResult
): Conflict[] {
  return Object.entries(result.persona).flatMap(
    ([fieldName, fields]) =>
      createConflict(fieldName, fields)
  );
}

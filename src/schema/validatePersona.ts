import {
  PersonaResult,
  PersonaResultSchema,
} from "./personaSchema";

export function validatePersona(
  data: unknown
): PersonaResult {
  return PersonaResultSchema.parse(data);
}

export function safeValidatePersona(
  data: unknown
) {
  return PersonaResultSchema.safeParse(data);
}

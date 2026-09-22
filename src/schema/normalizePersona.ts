import { PersonaResult } from "./personaSchema";

export function normalizePersona(
  persona: PersonaResult
): PersonaResult {
  return {
    ...persona,
    summary: persona.summary.trim(),
  };
}

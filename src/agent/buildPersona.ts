import {
  attachVerifiedEvidence,
  detectConflicts,
  detectGaps,
} from "../analysis";

import {
  PersonaResultSchema,
  type PersonaResult,
} from "../schema/personaSchema";

import { parseExtractedResponse } from "./parser";
import { buildPrompt } from "./prompt";
import {
  LLMProvider,
  MockProvider,
} from "./provider";

export interface BuildPersonaOptions {
  provider?: LLMProvider;
  useMockProvider?: boolean;
  mockFixtureMode?: "sparse" | "rich" | "conflicting";
  validateSchema?: boolean;
}

export async function buildPersona(
  rawInput: string,
  options: BuildPersonaOptions = {}
): Promise<PersonaResult> {
  validateInput(rawInput);

  const provider = resolveProvider(options);
  const prompt = buildPrompt(rawInput);
  const llmResponse = await provider.generate(prompt);

  const parsedResult = parseExtractedResponse(llmResponse);

  const evidenceChecked = attachVerifiedEvidence(
    rawInput,
    parsedResult
  );

  const analyzedResult: PersonaResult = {
    ...evidenceChecked,
    gaps: [
      ...evidenceChecked.gaps,
      ...detectGaps(evidenceChecked),
    ],
    conflicts: [
      ...evidenceChecked.conflicts,
      ...detectConflicts(evidenceChecked),
    ],
  };

  if (options.validateSchema !== false) {
    return PersonaResultSchema.parse(analyzedResult);
  }

  return analyzedResult;
}

function validateInput(input: string): void {
  if (typeof input !== "string") {
    throw new Error("Input must be a string.");
  }

  if (input.trim().length === 0) {
    throw new Error("Input cannot be empty.");
  }

  if (input.length > 50_000) {
    throw new Error("Input exceeds the maximum length of 50,000 characters.");
  }
}

function resolveProvider(
  options: BuildPersonaOptions
): LLMProvider {
  if (options.provider) {
    return options.provider;
  }

  return new MockProvider(
    options.mockFixtureMode ?? "sparse"
  );
}

export { LLMProvider, MockProvider } from "./provider";

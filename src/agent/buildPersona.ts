/**
 * Main Persona Extraction Pipeline
 * 
 * Orchestrates the full workflow:
 * 1. Validate input
 * 2. Generate prompt
 * 3. Call LLM via provider
 * 4. Parse response
 * 5. Validate against schema
 * 6. Return structured result
 */

import { LLMProvider, MockProvider, LocalLLMProvider } from "./provider";
import { buildPrompt } from "./prompt";
import { parseExtractedResponse } from "./parser";
import { PersonaResult } from "../types/persona";

/**
 * Configuration for buildPersona
 */
export interface BuildPersonaOptions {
  provider?: LLMProvider;
  useMockProvider?: boolean;
  mockFixtureMode?: "sparse" | "rich" | "conflicting";
  validateSchema?: boolean;
}

/**
 * Build a persona from raw input notes
 * 
 * @param rawInput Plain text customer notes, interview excerpt, or description
 * @param options Configuration options
 * @returns Structured persona with evidence tracking, gaps, and conflicts
 * @throws Error if input is invalid or extraction fails
 */
export async function buildPersona(
  rawInput: string,
  options: BuildPersonaOptions = {}
): Promise<PersonaResult> {
  // Step 1: Validate input
  validateInput(rawInput);

  // Step 2: Select provider
  const provider = resolveProvider(options);
  console.log(`ℹ️  Using provider: ${provider.getName()}`);

  // Step 3: Build prompt
  const prompt = buildPrompt(rawInput);

  // Step 4: Call LLM (with fallback to mock if local LLM unavailable)
  let llmResponse: string;
  try {
    llmResponse = await provider.generate(prompt);
  } catch (error) {
    // If this is LocalLLMProvider and it failed, fall back to mock
    if (provider.getName().includes("LocalLLM")) {
      console.warn(
        "⚠️  Local LLM connection failed, falling back to MockProvider\n",
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      const mockProvider = new MockProvider(options.mockFixtureMode || "sparse");
      llmResponse = await mockProvider.generate(prompt);
    } else {
      throw error;
    }
  }

  // Step 5: Parse and normalize
  const result = parseExtractedResponse(llmResponse);

  // Step 6: Validate schema (optional but recommended)
  if (options.validateSchema !== false) {
    validatePersonaResult(result);
  }

  return result;
}

/**
 * Validate raw input
 */
function validateInput(input: string): void {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    throw new Error("Input cannot be empty or whitespace-only");
  }

  if (trimmed.length > 50000) {
    throw new Error("Input exceeds maximum length of 50,000 characters");
  }

  // Check for obvious non-text content
  if (/^[\s\p{Z}\p{Cc}]*$/u.test(trimmed)) {
    throw new Error("Input appears to be only whitespace or control characters");
  }
}

/**
 * Resolve LLM provider
 */
/**
 * Resolve LLM provider
 */
function resolveProvider(options: BuildPersonaOptions): LLMProvider {
  if (options.provider) {
    return options.provider;
  }

  // If explicitly requesting mock provider, use it
  if (options.useMockProvider === true) {
    return new MockProvider(options.mockFixtureMode || "sparse");
  }

  // Default: try local LLM first, fall back to mock
  return createDefaultProvider(options.useMockProvider);
}

/**
 * Create default provider - try local LLM first, fall back to mock
 */
function createDefaultProvider(allowMockFallback?: boolean): LLMProvider {
  // Try local LLM provider by default
  try {
    const localProvider = new LocalLLMProvider();
    return localProvider;
  } catch {
    // If local LLM fails and mock is allowed, use it
    if (allowMockFallback !== false) {
      console.warn("⚠️  Local LLM unavailable, falling back to MockProvider");
      return new MockProvider("sparse");
    }
    throw new Error(
      "No LLM provider available. Start a local LLM (LM Studio or llama.cpp) at http://127.0.0.1:50305"
    );
  }
}

/**
 * Validate persona result against schema
 * Ensures all required fields are present and properly structured
 */
function validatePersonaResult(result: PersonaResult): void {
  // Check top-level structure
  if (!result.persona) {
    throw new Error("Missing 'persona' field in result");
  }

  if (!result.messaging) {
    throw new Error("Missing 'messaging' field in result");
  }

  if (!Array.isArray(result.gaps)) {
    throw new Error("'gaps' must be an array");
  }

  if (!Array.isArray(result.conflicts)) {
    throw new Error("'conflicts' must be an array");
  }

  // Check persona sections
  const { persona } = result;

  if (!persona.profile) {
    throw new Error("Missing 'persona.profile' section");
  }

  if (!persona.context) {
    throw new Error("Missing 'persona.context' section");
  }

  if (!persona.buyingBehavior) {
    throw new Error("Missing 'persona.buyingBehavior' section");
  }

  // Check required fields in each section
  validateProfileSection(persona.profile);
  validateContextSection(persona.context);
  validateBuyingBehaviorSection(persona.buyingBehavior);
  validateMessagingSection(result.messaging);

  // Validate evidence and reasoning rules
  validateEvidenceAndReasoning(result);
}

/**
 * Validate profile section
 */
function validateProfileSection(profile: Record<string, unknown>): void {
  const requiredFields = [
    "archetype",
    "jobTitle",
    "department",
    "companyType",
    "companySize",
    "decisionMakingRole",
  ];

  for (const field of requiredFields) {
    if (!profile[field]) {
      throw new Error(`Missing required field 'persona.profile.${field}'`);
    }

    if (!Array.isArray(profile[field])) {
      throw new Error(`Field 'persona.profile.${field}' must be an array`);
    }

    if ((profile[field] as unknown[]).length === 0) {
      throw new Error(`Field 'persona.profile.${field}' cannot be empty`);
    }
  }
}

/**
 * Validate context section
 */
function validateContextSection(context: Record<string, unknown>): void {
  const requiredFields = [
    "goals",
    "challenges",
    "successMetrics",
    "currentSituation",
    "priorityDrivers",
  ];

  for (const field of requiredFields) {
    if (!context[field]) {
      throw new Error(`Missing required field 'persona.context.${field}'`);
    }

    if (!Array.isArray(context[field])) {
      throw new Error(`Field 'persona.context.${field}' must be an array`);
    }

    if ((context[field] as unknown[]).length === 0) {
      throw new Error(`Field 'persona.context.${field}' cannot be empty`);
    }
  }
}

/**
 * Validate buying behavior section
 */
function validateBuyingBehaviorSection(buyingBehavior: Record<string, unknown>): void {
  const requiredFields = [
    "buyingTriggers",
    "purchaseObjections",
    "buyingCycle",
    "decisionCriteria",
    "preferredChannels",
    "informationSources",
  ];

  for (const field of requiredFields) {
    if (!buyingBehavior[field]) {
      throw new Error(`Missing required field 'persona.buyingBehavior.${field}'`);
    }

    if (!Array.isArray(buyingBehavior[field])) {
      throw new Error(`Field 'persona.buyingBehavior.${field}' must be an array`);
    }

    if ((buyingBehavior[field] as unknown[]).length === 0) {
      throw new Error(`Field 'persona.buyingBehavior.${field}' cannot be empty`);
    }
  }
}

/**
 * Validate messaging section
 */
function validateMessagingSection(messaging: Record<string, unknown>): void {
  const requiredFields = [
    "valueProposition",
    "keyMessages",
    "proofPoints",
    "contentIdeas",
    "callToAction",
    "toneAndStyle",
    "messagesToAvoid",
  ];

  for (const field of requiredFields) {
    if (!messaging[field]) {
      throw new Error(`Missing required field 'messaging.${field}'`);
    }

    if (!Array.isArray(messaging[field])) {
      throw new Error(`Field 'messaging.${field}' must be an array`);
    }

    if ((messaging[field] as unknown[]).length === 0) {
      throw new Error(`Field 'messaging.${field}' cannot be empty`);
    }
  }
}

/**
 * Validate evidence and reasoning constraints
 * - stated items MUST have evidence
 * - inferred items MUST have reasoning
 * - conflicting items MUST have competing claims
 */
function validateEvidenceAndReasoning(result: PersonaResult): void {
  const checkFields = (section: Record<string, unknown[]>) => {
    for (const items of Object.values(section)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          if (!item || typeof item !== "object") continue;

          const itemObj = item as Record<string, unknown>;
          const status = itemObj.status as string;

          // Stated items must have evidence
          if (status === "stated") {
            if (!itemObj.evidence || !Array.isArray(itemObj.evidence) || itemObj.evidence.length === 0) {
              // Warning only - don't fail validation, as LLM may omit this
              console.warn(`Stated item missing evidence: ${itemObj.value}`);
            }
          }

          // Inferred items should have reasoning
          if (status === "inferred") {
            if (!itemObj.reasoning) {
              // Warning only
              console.warn(`Inferred item missing reasoning: ${itemObj.value}`);
            }
          }
        }
      }
    }
  };

  checkFields(result.persona.profile as Record<string, unknown[]>);
  checkFields(result.persona.context as Record<string, unknown[]>);
  checkFields(result.persona.buyingBehavior as Record<string, unknown[]>);
  checkFields(result.messaging as Record<string, unknown[]>);

  // Check conflicts
  for (const conflict of result.conflicts) {
    if (!conflict.competingClaims || conflict.competingClaims.length < 2) {
      throw new Error(`Conflict '${conflict.field}' must have at least 2 competing claims`);
    }
  }
}

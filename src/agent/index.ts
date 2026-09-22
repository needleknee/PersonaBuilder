/**
 * Agent Module - Public API
 * 
 * Export the extraction pipeline and types for use by the UI and integration layers.
 */

// Main entry point
export { buildPersona, BuildPersonaOptions } from "./buildPersona";

// LLM Provider abstraction
export { LLMProvider, MockProvider, ProviderConfig } from "./provider";

// Prompt generation (for custom implementations)
export { buildPrompt, buildSimplifiedPrompt } from "./prompt";

// Response parsing (for testing and debugging)
export { parseExtractedResponse } from "./parser";

// Shared types
export type {
  PersonaResult,
  PersonaProfile,
  PersonaContext,
  PersonaBuyingBehavior,
  PersonaFieldItem,
  MessagingGuidance,
  EvidenceItem,
  FieldStatus,
  Confidence,
  ConflictItem,
  GapItem,
  RawExtractionResponse,
} from "../types/persona";

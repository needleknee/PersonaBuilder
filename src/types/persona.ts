/**
 * Shared Persona Result Contract
 * 
 * This type defines the output of the extraction pipeline.
 * Every field must be classified as stated, inferred, missing, or conflicting.
 */

/**
 * Evidence source for a claim.
 */
export interface EvidenceItem {
  quote: string;
  source?: string;
}

/**
 * Status of a claim.
 * - stated: directly supported by input
 * - inferred: reasonable interpretation not explicitly stated
 * - missing: input does not contain enough information
 * - conflicting: competing claims that cannot be safely reconciled
 */
export type FieldStatus = "stated" | "inferred" | "missing" | "conflicting";

/**
 * Confidence level for a claim.
 */
export type Confidence = "high" | "medium" | "low";

/**
 * A single persona or messaging field value with evidence and status.
 */
export interface PersonaFieldItem {
  value: string;
  status: FieldStatus;
  confidence: Confidence;
  evidence?: EvidenceItem[];
  reasoning?: string;
}

/**
 * A conflicting claim with competing values.
 */
export interface ConflictItem {
  field: string;
  competingClaims: Array<{
    value: string;
    source?: string;
    evidence?: EvidenceItem[];
  }>;
}

/**
 * A gap where information is insufficient.
 */
export interface GapItem {
  field: string;
  reason: string;
}

/**
 * B2B Persona Schema - Core Profile
 */
export interface PersonaProfile {
  archetype: PersonaFieldItem[];
  jobTitle: PersonaFieldItem[];
  department: PersonaFieldItem[];
  companyType: PersonaFieldItem[];
  companySize: PersonaFieldItem[];
  decisionMakingRole: PersonaFieldItem[];
}

/**
 * B2B Persona Schema - Business Context
 */
export interface PersonaContext {
  goals: PersonaFieldItem[];
  challenges: PersonaFieldItem[];
  successMetrics: PersonaFieldItem[];
  currentSituation: PersonaFieldItem[];
  priorityDrivers: PersonaFieldItem[];
}

/**
 * B2B Persona Schema - Buying Behavior
 */
export interface PersonaBuyingBehavior {
  buyingTriggers: PersonaFieldItem[];
  purchaseObjections: PersonaFieldItem[];
  buyingCycle: PersonaFieldItem[];
  decisionCriteria: PersonaFieldItem[];
  preferredChannels: PersonaFieldItem[];
  informationSources: PersonaFieldItem[];
}

/**
 * Messaging Guidance generated for this persona
 */
export interface MessagingGuidance {
  valueProposition: PersonaFieldItem[];
  keyMessages: PersonaFieldItem[];
  proofPoints: PersonaFieldItem[];
  contentIdeas: PersonaFieldItem[];
  callToAction: PersonaFieldItem[];
  toneAndStyle: PersonaFieldItem[];
  messagesToAvoid: PersonaFieldItem[];
}

/**
 * Complete Persona Result
 */
export interface PersonaResult {
  persona: {
    profile: PersonaProfile;
    context: PersonaContext;
    buyingBehavior: PersonaBuyingBehavior;
  };
  messaging: MessagingGuidance;
  gaps: GapItem[];
  conflicts: ConflictItem[];
  summary: string;
  extractedAt: string;
  confidence: {
    overall: Confidence;
    statedPercentage: number;
    inferredPercentage: number;
    missingPercentage: number;
  };
}

/**
 * Raw extraction response from LLM (before normalization)
 */
export interface RawExtractionResponse {
  persona?: {
    profile?: Record<string, unknown>;
    context?: Record<string, unknown>;
    buyingBehavior?: Record<string, unknown>;
  };
  messaging?: Record<string, unknown>;
  gaps?: unknown[];
  conflicts?: unknown[];
  summary?: string;
}

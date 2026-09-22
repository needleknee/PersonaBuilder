// Temporary local copy of the frozen shared contract (plan.md).
// When Person 4 merges src/schema/, delete this file and change imports to:
//   import type { PersonaResult, Field } from "../../schema/personaSchema";

export type FieldStatus = "stated" | "inferred" | "missing" | "conflicting";
export type Confidence = "high" | "medium" | "low";

export type Evidence = {
  quote: string;
  source: string;
};

export type Field = {
  value: string;
  status: FieldStatus;
  confidence: Confidence;
  evidence?: Evidence[];
  reasoning?: string;
};

export type Gap = {
  field: string;
  reason: string;
};

export type Conflict = {
  field: string;
  competingClaims: {
    value: string;
    source: string;
  }[];
};

export type PersonaResult = {
  persona: {
    jobTitle: Field[];
    department: Field[];
    companyType: Field[];
    companySize: Field[];
    goals: Field[];
    challenges: Field[];
    successMetrics: Field[];
    buyingTriggers: Field[];
    purchaseObjections: Field[];
    decisionMakingRole: Field[];
    preferredChannels: Field[];
  };
  messaging: {
    valueProposition: Field[];
    keyMessages: Field[];
    proofPoints: Field[];
    contentIdeas: Field[];
    callToAction: Field[];
  };
  buyingCommittee?: Field[];
  funnelStage?: Field[];
  gaps: Gap[];
  conflicts: Conflict[];
  summary: string;
};

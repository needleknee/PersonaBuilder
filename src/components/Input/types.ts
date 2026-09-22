// Local copy of the frozen shared contract from plan.md (lines ~500-584).
// Duplicated intentionally so Input Experience has zero dependency on
// src/schema/ existing yet. Replace with the real import from src/schema/
// during Phase 3 integration.

// UI-only status for the submission flow (not part of the shared contract).
export type SubmissionStatus = "idle" | "loading" | "success" | "error";

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

export type Field = {
  value: string;

  status: "stated" | "inferred" | "missing" | "conflicting";

  confidence: "high" | "medium" | "low";

  evidence?: Evidence[];

  reasoning?: string;
};

export type Evidence = {
  quote: string;
  source: string;
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

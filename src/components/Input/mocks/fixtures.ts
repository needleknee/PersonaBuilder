import type { Field, PersonaResult } from "../types";

const stated = (value: string, quote: string): Field => ({
  value,
  status: "stated",
  confidence: "high",
  evidence: [{ quote, source: "input" }],
});

const inferred = (value: string, reasoning: string, confidence: Field["confidence"] = "medium"): Field => ({
  value,
  status: "inferred",
  confidence,
  reasoning,
});

const missing = (reason: string): Field => ({
  value: "",
  status: "missing",
  confidence: "low",
  reasoning: reason,
});

export const sparseMockResult: PersonaResult = {
  persona: {
    jobTitle: [stated("Marketing Manager", "We mostly sell to marketing managers at mid-size SaaS companies.")],
    department: [inferred("Marketing", "Job title implies the Marketing department.")],
    companyType: [stated("SaaS", "mid-size SaaS companies")],
    companySize: [stated("Mid-size", "mid-size SaaS companies")],

    goals: [missing("Not present in the provided notes.")],
    challenges: [
      stated("Limited time", "They're busy"),
      stated("Budget constraints", "don't have big budgets"),
    ],

    successMetrics: [missing("Not present in the provided notes.")],

    buyingTriggers: [missing("Not present in the provided notes.")],
    purchaseObjections: [stated("Long sales cycles", "hate long sales calls")],

    decisionMakingRole: [missing("Not present in the provided notes.")],

    preferredChannels: [missing("Not present in the provided notes.")],
  },

  messaging: {
    valueProposition: [inferred("Fast, low-friction evaluation with no long sales calls", "Directly counters the stated objection to long sales calls.")],
    keyMessages: [inferred("Respect their time and budget", "Derived from busyness and budget-constraint challenges.")],
    proofPoints: [missing("No proof points available from sparse input.")],
    contentIdeas: [inferred("Short, self-serve product tour", "Matches a busy, low-budget buyer who avoids long calls.")],
    callToAction: [inferred("Try a self-serve demo instead of booking a call", "Avoids the stated objection.")],
  },

  gaps: [
    { field: "decisionMakingRole", reason: "Not present in the provided notes." },
    { field: "successMetrics", reason: "Not present in the provided notes." },
    { field: "preferredChannels", reason: "Not present in the provided notes." },
    { field: "buyingTriggers", reason: "Not present in the provided notes." },
  ],

  conflicts: [],

  summary:
    "A busy, budget-conscious Marketing Manager at a mid-size SaaS company who avoids long sales calls. Several fields remain unknown from this sparse input.",
};

export const richMockResult: PersonaResult = {
  persona: {
    jobTitle: [stated("Demand Generation Manager", "Jordan leads demand generation at a growing software company")],
    department: [stated("Marketing", "leads demand generation")],
    companyType: [stated("Software company", "a growing software company")],
    companySize: [inferred("Small team", "responsible for launching campaigns with a small team")],

    goals: [stated("Launch campaigns faster", "turn existing interview notes into a usable campaign brief without additional research")],
    challenges: [stated("Manual work transferring insights", "forced them to copy customer insights manually into every campaign brief, which delayed a product launch")],

    successMetrics: [inferred("Faster campaign execution", "Chose the product because it removed delays in launching campaigns.")],

    buyingTriggers: [stated("Campaign efficiency", "turn existing interview notes into a usable campaign brief without additional research or a long onboarding project")],
    purchaseObjections: [stated("Complex onboarding", "the first demo looked difficult to configure")],

    decisionMakingRole: [inferred("Champion / evaluator", "Personally evaluated the demo and made the purchase decision for their team.")],

    preferredChannels: [missing("Not present in the provided notes.")],
  },

  messaging: {
    valueProposition: [stated("Turn interview notes into a usable campaign brief without extra research or onboarding", "They ultimately chose it after seeing that their team could turn existing interview notes into a usable campaign brief")],
    keyMessages: [inferred("No manual copy-paste between tools", "Directly addresses the manual-transfer challenge.")],
    proofPoints: [stated("Removed manual insight transfer that previously delayed a launch", "forced them to copy customer insights manually into every campaign brief, which delayed a product launch")],
    contentIdeas: [inferred("Before/after workflow demo showing time saved on campaign briefs", "Speaks to both the challenge and the buying trigger.")],
    callToAction: [inferred("Offer a guided first-demo walkthrough to ease onboarding concerns", "Counters the stated onboarding objection.")],
  },

  gaps: [{ field: "preferredChannels", reason: "Not present in the provided notes." }],

  conflicts: [],

  summary:
    "Jordan, a Demand Generation Manager at a growing software company, adopted the product after it eliminated manual, delay-causing work — despite early concerns about setup complexity.",
};

export const conflictingMockResult: PersonaResult = {
  persona: {
    jobTitle: [missing("Not present in the provided notes.")],
    department: [missing("Not present in the provided notes.")],
    companyType: [
      {
        value: "Enterprise marketing organization",
        status: "conflicting",
        confidence: "low",
        evidence: [{ quote: "an enterprise marketing organization with a formal procurement process", source: "Sales" }],
      },
      {
        value: "Small or mid-size business",
        status: "conflicting",
        confidence: "low",
        evidence: [{ quote: "a small or mid-size business with a lean marketing team", source: "Growth" }],
      },
    ],
    companySize: [
      {
        value: "Enterprise",
        status: "conflicting",
        confidence: "low",
        evidence: [{ quote: "multiple regional teams", source: "Sales" }],
      },
      {
        value: "SMB / Mid-market",
        status: "conflicting",
        confidence: "low",
        evidence: [{ quote: "small or mid-size business", source: "Growth" }],
      },
    ],

    goals: [missing("Not present in the provided notes.")],
    challenges: [missing("Not present in the provided notes.")],

    successMetrics: [missing("Not present in the provided notes.")],

    buyingTriggers: [missing("Not present in the provided notes.")],
    purchaseObjections: [missing("Not present in the provided notes.")],

    decisionMakingRole: [missing("Not present in the provided notes.")],

    preferredChannels: [missing("Not present in the provided notes.")],
  },

  messaging: {
    valueProposition: [missing("Cannot generate a confident value proposition until the target segment conflict is resolved.")],
    keyMessages: [missing("Blocked by unresolved segment conflict.")],
    proofPoints: [missing("Blocked by unresolved segment conflict.")],
    contentIdeas: [missing("Blocked by unresolved segment conflict.")],
    callToAction: [inferred("Align Sales and Growth on target segment before producing messaging", "Two teams describe contradictory ideal customers.")],
  },

  gaps: [
    { field: "jobTitle", reason: "Not present in the provided notes." },
    { field: "goals", reason: "Not present in the provided notes." },
    { field: "challenges", reason: "Not present in the provided notes." },
  ],

  conflicts: [
    {
      field: "companyType / companySize",
      competingClaims: [
        { value: "Enterprise marketing organization", source: "Sales" },
        { value: "SMB / Mid-market marketing team", source: "Growth" },
      ],
    },
  ],

  summary:
    "Sales and Growth describe contradictory ideal customer segments (enterprise vs. SMB). Not enough evidence to determine the correct segment — resolve before producing messaging.",
};

export const genericMockResult: PersonaResult = {
  persona: {
    jobTitle: [inferred("Marketing professional", "General inference for arbitrary custom input.")],
    department: [inferred("Marketing", "General inference for arbitrary custom input.")],
    companyType: [missing("Not enough information to determine company type.")],
    companySize: [missing("Not enough information to determine company size.")],

    goals: [missing("Not enough information to determine goals.")],
    challenges: [missing("Not enough information to determine challenges.")],

    successMetrics: [missing("Not enough information to determine success metrics.")],

    buyingTriggers: [missing("Not enough information to determine buying triggers.")],
    purchaseObjections: [missing("Not enough information to determine objections.")],

    decisionMakingRole: [missing("Not enough information to determine decision-making role.")],

    preferredChannels: [missing("Not enough information to determine preferred channels.")],
  },

  messaging: {
    valueProposition: [missing("Not enough information to generate a value proposition.")],
    keyMessages: [missing("Not enough information to generate key messages.")],
    proofPoints: [missing("Not enough information to generate proof points.")],
    contentIdeas: [missing("Not enough information to generate content ideas.")],
    callToAction: [missing("Not enough information to generate a call to action.")],
  },

  gaps: [
    { field: "companyType", reason: "Not enough information to determine company type." },
    { field: "goals", reason: "Not enough information to determine goals." },
    { field: "challenges", reason: "Not enough information to determine challenges." },
  ],

  conflicts: [],

  summary:
    "This is a generic mock result for arbitrary custom input (Person 1's mock layer). Most fields are marked missing since this placeholder cannot analyze free-form text — the real buildPersona() will replace this.",
};

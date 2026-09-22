import type { FieldStatus, PersonaResult } from "./types";

type PersonaKey = keyof PersonaResult["persona"];
type MessagingKey = keyof PersonaResult["messaging"];

export const FIELD_LABELS: Record<string, string> = {
  jobTitle: "Job title",
  department: "Department",
  companyType: "Company type",
  companySize: "Company size",
  goals: "Goals",
  challenges: "Challenges",
  successMetrics: "Success metrics",
  buyingTriggers: "Buying triggers",
  purchaseObjections: "Purchase objections",
  decisionMakingRole: "Decision-making role",
  preferredChannels: "Preferred channels",
  valueProposition: "Value proposition",
  keyMessages: "Key messages",
  proofPoints: "Proof points",
  contentIdeas: "Content ideas",
  callToAction: "Call to action",
  buyingCommittee: "Buying committee role",
  funnelStage: "Funnel stage",
};

// Gaps/conflicts may come back as "companySize", "Company Size" or "company size".
export function labelFor(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  const normalized = field.replace(/[\s_-]/g, "").toLowerCase();
  const match = Object.keys(FIELD_LABELS).find((k) => k.toLowerCase() === normalized);
  return match ? FIELD_LABELS[match] : field;
}

export const PERSONA_GROUPS: { title: string; keys: PersonaKey[] }[] = [
  { title: "Who they are", keys: ["jobTitle", "department", "companyType", "companySize", "decisionMakingRole"] },
  { title: "What they want", keys: ["goals", "successMetrics"] },
  { title: "What stands in the way", keys: ["challenges", "purchaseObjections"] },
  { title: "How they buy", keys: ["buyingTriggers", "preferredChannels"] },
];

export const MESSAGING_KEYS: MessagingKey[] = [
  "valueProposition",
  "keyMessages",
  "proofPoints",
  "contentIdeas",
  "callToAction",
];

export const STATUS_TEXT: Record<FieldStatus, string> = {
  stated: "STATED",
  inferred: "INFERRED",
  missing: "MISSING",
  conflicting: "CONFLICTING",
};

export const STATUS_HELP: Record<FieldStatus, string> = {
  stated: "Said directly in the notes",
  inferred: "Reasoned by AI from the notes",
  missing: "Not found in the notes",
  conflicting: "Sources disagree",
};

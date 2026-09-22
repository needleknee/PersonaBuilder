import { z } from "zod";

export const StatusSchema = z.enum([
  "stated",
  "inferred",
  "missing",
  "conflicting",
]);

export const ConfidenceSchema = z.enum([
  "high",
  "medium",
  "low",
]);

export const EvidenceSchema = z.object({
  quote: z.string().min(1),
  source: z.string().min(1),
});

export const FieldSchema = z
  .object({
    value: z.string(),
    status: StatusSchema,
    confidence: ConfidenceSchema,
    evidence: z.array(EvidenceSchema).optional(),
    reasoning: z.string().optional(),
  })
  .superRefine((field, ctx) => {
    if (
      field.status === "stated" &&
      (!field.evidence || field.evidence.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stated fields must include evidence",
      });
    }

    if (
      field.status === "inferred" &&
      (!field.reasoning || !field.reasoning.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inferred fields must include reasoning",
      });
    }

    if (
      field.status === "missing" &&
      field.value.trim() !== ""
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing fields cannot contain values",
      });
    }
  });

export const GapSchema = z.object({
  field: z.string(),
  reason: z.string(),
});

export const ConflictSchema = z.object({
  field: z.string(),
  competingClaims: z
    .array(
      z.object({
        value: z.string(),
        source: z.string(),
      })
    )
    .min(2),
});

export const PersonaResultSchema = z.object({
  persona: z.object({
    jobTitle: z.array(FieldSchema),
    department: z.array(FieldSchema),
    companyType: z.array(FieldSchema),
    companySize: z.array(FieldSchema),
    goals: z.array(FieldSchema),
    challenges: z.array(FieldSchema),
    successMetrics: z.array(FieldSchema),
    buyingTriggers: z.array(FieldSchema),
    purchaseObjections: z.array(FieldSchema),
    decisionMakingRole: z.array(FieldSchema),
    preferredChannels: z.array(FieldSchema),
  }),

  messaging: z.object({
    valueProposition: z.array(FieldSchema),
    keyMessages: z.array(FieldSchema),
    proofPoints: z.array(FieldSchema),
    contentIdeas: z.array(FieldSchema),
    callToAction: z.array(FieldSchema),
  }),

  buyingCommittee: z.array(FieldSchema).optional(),
  funnelStage: z.array(FieldSchema).optional(),

  gaps: z.array(GapSchema),
  conflicts: z.array(ConflictSchema),

  summary: z.string(),
});

export type PersonaResult = z.infer<
  typeof PersonaResultSchema
>;

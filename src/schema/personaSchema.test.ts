import { describe, expect, test } from "vitest";
import { PersonaResultSchema } from "./personaSchema";

const basePersona = {
  persona: {
    jobTitle: [],
    department: [],
    companyType: [],
    companySize: [],
    goals: [],
    challenges: [],
    successMetrics: [],
    buyingTriggers: [],
    purchaseObjections: [],
    decisionMakingRole: [],
    preferredChannels: [],
  },

  messaging: {
    valueProposition: [],
    keyMessages: [],
    proofPoints: [],
    contentIdeas: [],
    callToAction: [],
  },

  gaps: [],
  conflicts: [],
  summary: "Test Persona",
};

describe("PersonaResultSchema", () => {
  test("accepts valid stated field with evidence", () => {
    const result = {
      ...basePersona,
      persona: {
        ...basePersona.persona,
        jobTitle: [
          {
            value: "Marketing Manager",
            status: "stated",
            confidence: "high",
            evidence: [
              {
                quote: "We sell to marketing managers",
                source: "input",
              },
            ],
          },
        ],
      },
    };

    expect(() =>
      PersonaResultSchema.parse(result)
    ).not.toThrow();
  });

  test("rejects invalid status", () => {
    const result = {
      ...basePersona,
      persona: {
        ...basePersona.persona,
        jobTitle: [
          {
            value: "Marketing Manager",
            status: "verified",
            confidence: "high",
          },
        ],
      },
    };

    const parsed =
      PersonaResultSchema.safeParse(result);

    expect(parsed.success).toBe(false);
  });

  test("rejects stated field without evidence", () => {
    const result = {
      ...basePersona,
      persona: {
        ...basePersona.persona,
        jobTitle: [
          {
            value: "Marketing Manager",
            status: "stated",
            confidence: "high",
          },
        ],
      },
    };

    const parsed =
      PersonaResultSchema.safeParse(result);

    expect(parsed.success).toBe(false);
  });

  test("accepts inferred field with reasoning", () => {
    const result = {
      ...basePersona,
      persona: {
        ...basePersona.persona,
        decisionMakingRole: [
          {
            value: "Decision Maker",
            status: "inferred",
            confidence: "medium",
            reasoning:
              "Responsible for purchasing decisions",
          },
        ],
      },
    };

    expect(() =>
      PersonaResultSchema.parse(result)
    ).not.toThrow();
  });

  test("rejects inferred field without reasoning", () => {
    const result = {
      ...basePersona,
      persona: {
        ...basePersona.persona,
        decisionMakingRole: [
          {
            value: "Decision Maker",
            status: "inferred",
            confidence: "medium",
          },
        ],
      },
    };

    const parsed =
      PersonaResultSchema.safeParse(result);

    expect(parsed.success).toBe(false);
  });

  test("accepts missing field without value", () => {
    const result = {
      ...basePersona,
      persona: {
        ...basePersona.persona,
        preferredChannels: [
          {
            value: "",
            status: "missing",
            confidence: "low",
          },
        ],
      },
    };

    expect(() =>
      PersonaResultSchema.parse(result)
    ).not.toThrow();
  });

  test("rejects missing field containing value", () => {
    const result = {
      ...basePersona,
      persona: {
        ...basePersona.persona,
        preferredChannels: [
          {
            value: "LinkedIn",
            status: "missing",
            confidence: "low",
          },
        ],
      },
    };

    const parsed =
      PersonaResultSchema.safeParse(result);

    expect(parsed.success).toBe(false);
  });

  test("accepts valid conflict", () => {
    const result = {
      ...basePersona,
      conflicts: [
        {
          field: "companySize",
          competingClaims: [
            {
              value: "Enterprise",
              source: "Sales",
            },
            {
              value: "SMB",
              source: "Growth",
            },
          ],
        },
      ],
    };

    expect(() =>
      PersonaResultSchema.parse(result)
    ).not.toThrow();
  });

  test("rejects conflict with only one claim", () => {
    const result = {
      ...basePersona,
      conflicts: [
        {
          field: "companySize",
          competingClaims: [
            {
              value: "Enterprise",
              source: "Sales",
            },
          ],
        },
      ],
    };

    const parsed =
      PersonaResultSchema.safeParse(result);

    expect(parsed.success).toBe(false);
  });

  test("accepts complete valid persona", () => {
    const parsed =
      PersonaResultSchema.safeParse(basePersona);

    expect(parsed.success).toBe(true);
  });
});

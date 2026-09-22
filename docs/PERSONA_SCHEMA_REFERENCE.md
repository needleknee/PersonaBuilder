# PersonaResult Data Structure Reference

Complete reference for the JSON schema returned by `buildPersona()`.

---

## Top-Level Structure

```typescript
interface PersonaResult {
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
    overall: "high" | "medium" | "low";
    statedPercentage: number;
    inferredPercentage: number;
    missingPercentage: number;
  };
}
```

---

## Individual Field Item

Every field (in profile, context, buyingBehavior, messaging) follows this structure:

```typescript
interface PersonaFieldItem {
  value: string;                    // The claim or guidance text
  status: FieldStatus;              // "stated" | "inferred" | "missing" | "conflicting"
  confidence: Confidence;           // "high" | "medium" | "low"
  evidence?: EvidenceItem[];        // (required for "stated")
  reasoning?: string;               // (required for "inferred")
}

interface EvidenceItem {
  quote: string;                    // Direct quote from input
  source?: string;                  // Where it came from (default: "input")
}
```

---

## Profile Section

```typescript
interface PersonaProfile {
  archetype: PersonaFieldItem[];
  jobTitle: PersonaFieldItem[];
  department: PersonaFieldItem[];
  companyType: PersonaFieldItem[];
  companySize: PersonaFieldItem[];
  decisionMakingRole: PersonaFieldItem[];
}
```

### Example: archetype (STATED)

```json
{
  "value": "Time-Constrained Marketing Manager",
  "status": "stated",
  "confidence": "high",
  "evidence": [{
    "quote": "marketing managers at mid-size SaaS companies. They're busy",
    "source": "input"
  }]
}
```

### Example: companySize (INFERRED)

```json
{
  "value": "Mid-market (estimated 50-500 employees)",
  "status": "inferred",
  "confidence": "medium",
  "reasoning": "Called 'mid-size SaaS' in the input; typical range for this category is 50-500 employees"
}
```

### Example: decisionMakingRole (MISSING)

```json
{
  "value": "Not specified in input",
  "status": "missing",
  "confidence": "high"
}
```

---

## Context Section

```typescript
interface PersonaContext {
  goals: PersonaFieldItem[];
  challenges: PersonaFieldItem[];
  successMetrics: PersonaFieldItem[];
  currentSituation: PersonaFieldItem[];
  priorityDrivers: PersonaFieldItem[];
}
```

### Example: challenges (STATED)

```json
{
  "value": "Manual data entry delays campaign execution",
  "status": "stated",
  "confidence": "high",
  "evidence": [{
    "quote": "forced them to copy customer insights manually into every campaign brief, which delayed a product launch",
    "source": "input"
  }]
}
```

### Example: successMetrics (MISSING)

```json
{
  "value": "Not specified in input",
  "status": "missing",
  "confidence": "high"
}
```

---

## Buying Behavior Section

```typescript
interface PersonaBuyingBehavior {
  buyingTriggers: PersonaFieldItem[];
  purchaseObjections: PersonaFieldItem[];
  buyingCycle: PersonaFieldItem[];
  decisionCriteria: PersonaFieldItem[];
  preferredChannels: PersonaFieldItem[];
  informationSources: PersonaFieldItem[];
}
```

### Example: purchaseObjections (STATED)

```json
{
  "value": "Dislikes lengthy sales processes and complex onboarding",
  "status": "stated",
  "confidence": "high",
  "evidence": [
    {
      "quote": "hate long sales calls",
      "source": "input"
    },
    {
      "quote": "long onboarding project",
      "source": "input"
    }
  ]
}
```

### Example: buyingTriggers (INFERRED)

```json
{
  "value": "Demonstrated workflow improvement for their specific use case",
  "status": "inferred",
  "confidence": "high",
  "reasoning": "Input shows they chose the product after seeing it solve their exact problem (turning interview notes into campaign briefs)"
}
```

---

## Messaging Guidance Section

```typescript
interface MessagingGuidance {
  valueProposition: PersonaFieldItem[];
  keyMessages: PersonaFieldItem[];
  proofPoints: PersonaFieldItem[];
  contentIdeas: PersonaFieldItem[];
  callToAction: PersonaFieldItem[];
  toneAndStyle: PersonaFieldItem[];
  messagesToAvoid: PersonaFieldItem[];
}
```

### Example: keyMessages

```json
[
  {
    "value": "Get campaigns to market in days instead of weeks, not months",
    "status": "inferred",
    "confidence": "high",
    "reasoning": "Addresses stated pain of delayed launches and small team constraints"
  },
  {
    "value": "No complex setup or lengthy training required",
    "status": "stated",
    "confidence": "high",
    "evidence": [{
      "quote": "no additional research or a long onboarding project",
      "source": "input"
    }]
  },
  {
    "value": "Works with your existing customer interview notes",
    "status": "stated",
    "confidence": "high",
    "evidence": [{
      "quote": "turn existing interview notes into a usable campaign brief",
      "source": "input"
    }]
  }
]
```

### Example: callToAction

```json
{
  "value": "Try free demo with your own campaign brief",
  "status": "inferred",
  "confidence": "high",
  "reasoning": "This persona is driven by workflow validation; a free demo lets them test their exact use case without risk"
}
```

---

## Gaps Array

```typescript
interface GapItem {
  field: string;           // Which field is missing
  reason: string;          // Why we can't fill it
}
```

### Example

```json
{
  "gaps": [
    {
      "field": "decisionMakingRole",
      "reason": "Input does not specify who drives purchase decisions (Marketing Manager, CMO, both, etc.)"
    },
    {
      "field": "successMetrics",
      "reason": "No KPIs or success measures defined for this persona"
    },
    {
      "field": "preferredChannels",
      "reason": "No information about how this persona prefers to be contacted"
    }
  ]
}
```

---

## Conflicts Array

```typescript
interface ConflictItem {
  field: string;
  competingClaims: Array<{
    value: string;
    source?: string;
    evidence?: EvidenceItem[];
  }>;
}
```

### Example

```json
{
  "conflicts": [
    {
      "field": "companySize",
      "competingClaims": [
        {
          "value": "Enterprise organization with formal procurement",
          "source": "Sales",
          "evidence": [{
            "quote": "Enterprise marketing organization with a formal procurement process and multiple regional teams",
            "source": "input"
          }]
        },
        {
          "value": "Small or mid-size business with lean team",
          "source": "Growth",
          "evidence": [{
            "quote": "small or mid-size business with a lean marketing team that can buy and adopt tools quickly",
            "source": "input"
          }]
        }
      ]
    },
    {
      "field": "buyingProcess",
      "competingClaims": [
        {
          "value": "Formal, multi-stakeholder procurement",
          "source": "Sales"
        },
        {
          "value": "Quick, self-directed adoption",
          "source": "Growth"
        }
      ]
    }
  ]
}
```

---

## Confidence Section

```json
{
  "confidence": {
    "overall": "high",
    "statedPercentage": 60,
    "inferredPercentage": 35,
    "missingPercentage": 5
  }
}
```

**Interpretation:**
- **overall:** "high" = mostly stated facts; "medium" = mix of stated and inferred; "low" = mostly gaps
- **statedPercentage:** Directly quoted from input
- **inferredPercentage:** Reasonable interpretations
- **missingPercentage:** Information not in input (gaps)
- **Sum:** Always equals 100

---

## Timestamp

```json
{
  "extractedAt": "2024-09-22T14:30:45.123Z"
}
```

ISO 8601 format timestamp when extraction completed.

---

## Summary

```json
{
  "summary": "Jordan is a hands-on Demand Generation leader at a growth-stage SaaS company with a small team. They are driven by operational efficiency and speed-to-campaign, with a strong aversion to tool complexity and lengthy onboarding. A recent campaign delay from manual data entry was a key pain point. The buying trigger was a product demo that showed clear, immediate workflow improvement. This persona values simplicity, rapid time-to-value, and tools that let small teams move fast."
}
```

**Length:** Typically 2-3 sentences (max 1000 chars)  
**Purpose:** Quick reference for who this persona is and why they matter

---

## Complete Example: Full PersonaResult

```json
{
  "persona": {
    "profile": {
      "archetype": [{
        "value": "Hands-On Demand Generation Leader",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Leads demand generation and handles hands-on execution"
      }],
      "jobTitle": [{
        "value": "Demand Generation Manager / Lead",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "Jordan leads demand generation"}]
      }],
      "department": [{
        "value": "Marketing / Demand Generation",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "leads demand generation"}]
      }],
      "companyType": [{
        "value": "B2B Software (SaaS)",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "software company"}]
      }],
      "companySize": [{
        "value": "Growth-stage / Early mid-market",
        "status": "stated",
        "confidence": "medium",
        "evidence": [{"quote": "growing software company"}]
      }],
      "decisionMakingRole": [{
        "value": "Hands-on executor with input on tool selection",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Directly evaluates and tests products"
      }]
    },
    "context": {
      "goals": [{
        "value": "Launch campaigns quickly with small team",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "responsible for launching campaigns with a small team"}]
      }],
      "challenges": [{
        "value": "Manual data entry delays campaigns",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "forced them to copy customer insights manually into every campaign brief, which delayed a product launch"}]
      }],
      "successMetrics": [{
        "value": "Campaign launch velocity",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Delayed launch mentioned as pain point"
      }],
      "currentSituation": [{
        "value": "Using planning tool with poor manual workflow",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "their current planning tool"}]
      }],
      "priorityDrivers": [{
        "value": "Speed and ease of use",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "no additional research or a long onboarding project"}]
      }]
    },
    "buyingBehavior": {
      "buyingTriggers": [{
        "value": "Proof of specific workflow improvement",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "They ultimately chose it after seeing that their team could turn existing interview notes into a usable campaign brief"}]
      }],
      "purchaseObjections": [{
        "value": "Complex configuration and steep learning curve",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "almost rejected our product because the first demo looked difficult to configure"}]
      }],
      "buyingCycle": [{
        "value": "Short (days to 1-2 weeks) with hands-on evaluation",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Decision made after seeing demo"
      }],
      "decisionCriteria": [{
        "value": "Demonstrable workflow improvement",
        "status": "stated",
        "confidence": "high",
        "evidence": [{"quote": "chose it after seeing that their team could turn existing interview notes into a usable campaign brief"}]
      }],
      "preferredChannels": [{
        "value": "Product demo focused on specific workflow",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Decision influenced by hands-on product demo"
      }],
      "informationSources": [{
        "value": "Direct product evaluation and trial",
        "status": "stated",
        "confidence": "high"
      }]
    }
  },
  "messaging": {
    "valueProposition": [{
      "value": "Turn customer insights directly into campaign briefs without manual copying or lengthy setup",
      "status": "stated",
      "confidence": "high",
      "evidence": [{"quote": "turn existing interview notes into a usable campaign brief without additional research or a long onboarding project"}]
    }],
    "keyMessages": [
      {
        "value": "Launch campaigns faster by eliminating manual data entry",
        "status": "inferred",
        "confidence": "high"
      },
      {
        "value": "Your team gets productive in minutes, not weeks",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Counters the 'long onboarding' objection"
      }
    ],
    "proofPoints": [{
      "value": "Used by growth-stage SaaS teams",
      "status": "inferred",
      "confidence": "medium"
    }],
    "contentIdeas": [{
      "value": "Case study: How [Company] cut campaign prep time by 80%",
      "status": "inferred",
      "confidence": "high"
    }],
    "callToAction": [{
      "value": "Try free demo with your own campaign brief",
      "status": "inferred",
      "confidence": "high",
      "reasoning": "Persona driven by workflow validation"
    }],
    "toneAndStyle": [{
      "value": "Action-oriented, pragmatic, results-focused",
      "status": "inferred",
      "confidence": "high"
    }],
    "messagesToAvoid": [{
      "value": "Complex feature explanations",
      "status": "inferred",
      "confidence": "high"
    }]
  },
  "gaps": [
    {
      "field": "budget",
      "reason": "No information about budget constraints or procurement process"
    },
    {
      "field": "geography",
      "reason": "No location or regional information provided"
    }
  ],
  "conflicts": [],
  "summary": "Jordan is a hands-on Demand Generation leader at a growth-stage SaaS company with a small team. They prioritize speed and ease of use, with a strong aversion to complexity and lengthy onboarding. A recent campaign delay from manual work was a key trigger. This persona values tools that enable rapid time-to-value.",
  "extractedAt": "2024-09-22T14:30:45.123Z",
  "confidence": {
    "overall": "high",
    "statedPercentage": 60,
    "inferredPercentage": 35,
    "missingPercentage": 5
  }
}
```

---

## Accessing Data in Code

### Iterate Profile Fields

```typescript
for (const item of result.persona.profile.jobTitle) {
  console.log(`${item.value} (${item.status})`);
  if (item.status === "stated" && item.evidence) {
    console.log(`  Evidence: "${item.evidence[0].quote}"`);
  }
}
```

### Find High-Confidence Claims

```typescript
const highConfidence = Object.values(result.persona.profile)
  .flat()
  .filter(item => item.confidence === "high");
```

### Check for Gaps

```typescript
if (result.gaps.length > 0) {
  console.log("Follow-up questions needed:");
  result.gaps.forEach(gap => console.log(`- ${gap.field}: ${gap.reason}`));
}
```

### Handle Conflicts

```typescript
for (const conflict of result.conflicts) {
  console.log(`Conflict in ${conflict.field}:`);
  conflict.competingClaims.forEach(claim => {
    console.log(`  - "${claim.value}" (${claim.source})`);
  });
}
```

### Extract All Evidence

```typescript
const allEvidence = [];
const walkFields = (fields) => {
  Object.values(fields).flat().forEach(item => {
    if (item.evidence) {
      allEvidence.push(...item.evidence);
    }
  });
};
walkFields(result.persona.profile);
walkFields(result.persona.context);
walkFields(result.persona.buyingBehavior);
```

---

**Use this reference when implementing UI rendering, validation, or analysis of extraction results.**

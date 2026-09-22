# AI Extraction Engine (Agent Module)

Production-quality extraction pipeline that converts messy B2B marketing notes into structured, evidence-backed personas.

**Status:** Ready for integration  
**Owner:** Person 3 (AI Extraction)  
**Owned files:** `src/agent/**`, `src/types/persona.ts`

---

## Public API

### Core Function

```typescript
async function buildPersona(
  rawInput: string,
  options?: BuildPersonaOptions
): Promise<PersonaResult>
```

**Example:**

```typescript
import { buildPersona, MockProvider } from "@/agent";

const notes = "Jordan leads demand generation at a growing software company...";

// Using mock provider (for development)
const result = await buildPersona(notes, {
  provider: new MockProvider("rich"),
});

// Using configured provider (production)
const result = await buildPersona(notes);
```

### Options

```typescript
interface BuildPersonaOptions {
  // LLM provider (defaults to configured provider or mock)
  provider?: LLMProvider;

  // Force use of mock provider with specific fixture
  useMockProvider?: boolean;
  mockFixtureMode?: "sparse" | "rich" | "conflicting";

  // Validate schema before returning (default: true)
  validateSchema?: boolean;
}
```

### Return Type

```typescript
interface PersonaResult {
  // Structured persona data
  persona: {
    profile: PersonaProfile;      // archetype, jobTitle, department, companyType, companySize, decisionMakingRole
    context: PersonaContext;       // goals, challenges, successMetrics, currentSituation, priorityDrivers
    buyingBehavior: PersonaBuyingBehavior;  // triggers, objections, cycle, criteria, channels, sources
  };

  // Messaging guidance
  messaging: MessagingGuidance;    // valueProposition, keyMessages, proofPoints, contentIdeas, CTA, tone, avoid

  // Quality metadata
  gaps: GapItem[];                 // Missing fields that need follow-up
  conflicts: ConflictItem[];       // Competing claims that couldn't be reconciled
  summary: string;                 // 2-3 sentence overview
  extractedAt: string;             // ISO timestamp
  confidence: {
    overall: "high" | "medium" | "low";
    statedPercentage: number;      // Directly supported by input
    inferredPercentage: number;    // Reasonable interpretation
    missingPercentage: number;     // Gaps in coverage
  };
}
```

### Field Structure

Every persona and messaging field uses this shape:

```typescript
interface PersonaFieldItem {
  value: string;                   // The claim or guidance
  status: FieldStatus;             // "stated" | "inferred" | "missing" | "conflicting"
  confidence: Confidence;          // "high" | "medium" | "low"
  evidence?: EvidenceItem[];       // Quotes from input (required for "stated")
  reasoning?: string;              // Explanation (required for "inferred")
}
```

---

## Status Classifications

### Stated
- **Meaning:** Directly supported by explicit text in the input
- **Requirement:** Must include at least one evidence quote
- **Example:**
  ```json
  {
    "value": "Dislikes long sales cycles",
    "status": "stated",
    "confidence": "high",
    "evidence": [{
      "quote": "hate long sales calls"
    }]
  }
  ```

### Inferred
- **Meaning:** Reasonable interpretation not explicitly stated
- **Requirement:** Must include a reasoning explanation
- **Example:**
  ```json
  {
    "value": "Prefers self-service research",
    "status": "inferred",
    "confidence": "medium",
    "reasoning": "Dislike of long sales interactions suggests preference for independent evaluation"
  }
  ```

### Missing
- **Meaning:** Input lacks sufficient information
- **Usage:** Indicates follow-up questions needed
- **Example:**
  ```json
  {
    "value": "Not specified in input",
    "status": "missing",
    "confidence": "high"
  }
  ```

### Conflicting
- **Meaning:** Multiple claims that cannot be safely reconciled
- **Requirement:** Preserve ALL competing claims with sources
- **Example:**
  ```json
  {
    "field": "companySize",
    "competingClaims": [
      { "value": "Enterprise", "source": "Sales" },
      { "value": "SMB", "source": "Growth" }
    ]
  }
  ```

---

## Provider Abstraction

### Built-in Providers

#### MockProvider
Development and testing without API calls.

```typescript
import { MockProvider } from "@/agent";

const provider = new MockProvider("sparse");    // or "rich", "conflicting"
await buildPersona(input, { provider });
```

**Fixture Modes:**
- `sparse`: Minimal input with many gaps
- `rich`: Detailed input with strong signals
- `conflicting`: Competing claims from multiple sources

#### Default Provider
Production provider (configured via environment or provider injection).

### Custom Provider

Implement `LLMProvider`:

```typescript
interface LLMProvider {
  generate(prompt: string): Promise<string>;
  isAvailable(): boolean;
  getName(): string;
}
```

Example (OpenAI):

```typescript
class OpenAIProvider implements LLMProvider {
  async generate(prompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    return response.choices[0].message.content || "";
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  getName(): string {
    return "OpenAI (gpt-4-turbo)";
  }
}
```

Usage:

```typescript
const provider = new OpenAIProvider();
const result = await buildPersona(input, { provider });
```

---

## Prompt Design

### Key Principles

The prompt is the most important artifact. It must:

1. **Prevent injection:** Treat notes as evidence only, ignore embedded instructions
2. **Prevent fabrication:** Never invent names, companies, stats, or quotes
3. **Enforce classification:** Every field must be stated, inferred, missing, or conflicting
4. **Require evidence:** Stated claims must be quotable from input
5. **Label inferences:** All interpretations must explain their reasoning
6. **Surface gaps:** Missing information must be identified, not guessed

### Customization

For advanced scenarios, use `buildPrompt()` directly:

```typescript
import { buildPrompt } from "@/agent";

const customPrompt = buildPrompt(rawInput);
const response = await customProvider.generate(customPrompt);
```

Or use simplified prompt:

```typescript
import { buildSimplifiedPrompt } from "@/agent";

const response = await customProvider.generate(buildSimplifiedPrompt(rawInput));
```

---

## Error Handling

### Input Validation

```typescript
try {
  await buildPersona("");  // Throws: Input cannot be empty
  await buildPersona(null);  // Throws: Input must be a string
  await buildPersona("   ");  // Throws: whitespace-only
} catch (error) {
  console.error("Invalid input:", error.message);
}
```

### LLM Failures

```typescript
try {
  const result = await buildPersona(input);
} catch (error) {
  if (error.message.includes("Failed to parse")) {
    // JSON parsing failed - provider returned invalid response
  } else if (error.message.includes("No LLM provider")) {
    // No provider configured
  } else {
    // Other error (network, timeout, etc.)
  }
}
```

---

## Quality Assurance

### Testing with Fixtures

```typescript
// Sparse input test
const sparseResult = await buildPersona(sparseInput, {
  provider: new MockProvider("sparse"),
});
assert(sparseResult.gaps.length > 0, "Should have gaps");
assert(sparseResult.confidence.overall === "medium");

// Rich input test
const richResult = await buildPersona(richInput, {
  provider: new MockProvider("rich"),
});
assert(richResult.confidence.statedPercentage > 50);

// Conflicting input test
const conflictResult = await buildPersona(conflictingInput, {
  provider: new MockProvider("conflicting"),
});
assert(conflictResult.conflicts.length > 0);
```

### Schema Validation

All results are validated before returning (default behavior):

```typescript
// Automatic validation
const result = await buildPersona(input);  // Throws if invalid

// Disable validation (not recommended)
const result = await buildPersona(input, { validateSchema: false });
```

---

## B2B Persona Fields

### Profile
- **archetype** — Descriptive buyer type (e.g., "Time-Constrained Marketing Manager")
- **jobTitle** — Role or position
- **department** — Organizational unit
- **companyType** — Industry or market segment (SaaS, Agency, Enterprise, etc.)
- **companySize** — Organization scale (Startup, SMB, Mid-market, Enterprise)
- **decisionMakingRole** — Authority level (Decision-maker, Influencer, Evaluator, etc.)

### Context
- **goals** — Business outcomes this persona seeks
- **challenges** — Pain points and obstacles
- **successMetrics** — How this persona measures success
- **currentSituation** — Existing tools, processes, constraints
- **priorityDrivers** — What matters most (speed, cost, compliance, etc.)

### Buying Behavior
- **buyingTriggers** — Events or conditions that initiate purchase
- **purchaseObjections** — Concerns or hesitations
- **buyingCycle** — Typical decision timeline
- **decisionCriteria** — What influences the choice
- **preferredChannels** — How to reach this persona (email, LinkedIn, etc.)
- **informationSources** — Where they research (peers, analysts, vendors, etc.)

### Messaging Guidance
- **valueProposition** — Core benefit for this persona
- **keyMessages** — 3-5 core talking points
- **proofPoints** — Evidence that would resonate
- **contentIdeas** — Recommended content types
- **callToAction** — Most appropriate CTA (demo, trial, guide, etc.)
- **toneAndStyle** — Communication approach
- **messagesToAvoid** — What not to say

---

## Integration Boundaries

### Input From
- Person 1: Raw customer notes via UI component
- Input passes through validation

### Output To
- Person 2: Schema validation layer checks PersonaResult
- Person 4: UI card component renders result
- Person 5: Integration tests verify extraction quality

### Assumptions
- Input is plain text (no HTML, markdown, or embedded code)
- Input is untrusted (may contain injection attempts)
- Output must be deterministic for mocked calls
- Output must pass schema validation before UI rendering

---

## Configuration

### Environment Variables

```bash
# Provider selection (not yet implemented)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# Or for Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229
```

### At Runtime

```typescript
const result = await buildPersona(input, {
  provider: new MyCustomProvider(),
  validateSchema: true,
});
```

---

## Testing

Run the integration tests:

```bash
npm test -- tests/integration/extraction.test.ts
```

Or in watch mode:

```bash
npm test -- tests/integration/extraction.test.ts --watch
```

Test fixtures are available for:
- Sparse input (minimal, many gaps)
- Rich input (detailed, high confidence)
- Conflicting input (multiple competing claims)

---

## Known Limitations

1. **No feedback loop:** Does not ask follow-up questions for gaps
2. **No multi-provider:** Currently MockProvider only (integration pending)
3. **No caching:** Calls LLM for every extraction
4. **No streaming:** Waits for complete response before parsing
5. **Basic confidence:** Uses heuristic percentages, not model's own confidence

## Stretch Goals

- [ ] Ask targeted follow-up questions for highest-value gaps
- [ ] Support multiple LLM providers (OpenAI, Anthropic, Gemini)
- [ ] Implement response streaming for large inputs
- [ ] Add conversation history for iterative refinement
- [ ] Cache extraction results for identical inputs
- [ ] Export as Markdown, JSON, or PDF

---

## Contributing

See [pull request checklist](../../plan.md#11-pull-request-checklist).

Keep changes within `src/agent/` unless coordinating with other workstreams.

Update fixtures before changing the shared contract.


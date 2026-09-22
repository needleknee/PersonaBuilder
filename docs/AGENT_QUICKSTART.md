# AI Extraction Engine - Quick Start Guide

Welcome to Person 3's AI Extraction Engine! This guide gets you oriented quickly.

---

## What It Does

Converts messy B2B marketing notes into structured personas with full evidence tracking.

**Input:**
```
Jordan leads demand generation at a growing software company...
```

**Output:**
```json
{
  "persona": {
    "profile": { "jobTitle": [...], "companyType": [...], ... },
    "context": { "goals": [...], "challenges": [...], ... },
    "buyingBehavior": { "triggers": [...], "objections": [...], ... }
  },
  "messaging": { "valueProposition": [...], "keyMessages": [...], ... },
  "gaps": [ { "field": "...", "reason": "..." } ],
  "conflicts": [ { "field": "...", "competingClaims": [...] } ],
  "summary": "Jordan is a hands-on demand generation leader..."
}
```

---

## Key Features

✅ **Evidence-Backed** — Every claim linked to source or marked as inference  
✅ **Conflict-Aware** — Preserves competing claims (doesn't pick one silently)  
✅ **Gap-Honest** — Shows missing information instead of fabricating  
✅ **No Hallucination** — Never invents names, companies, or stats  
✅ **Injection-Safe** — Treats notes as untrusted evidence  
✅ **Mock-Ready** — Test with realistic fixtures without API keys  

---

## Quick Use

### Development (with mock data)

```typescript
import { buildPersona, MockProvider } from "@/agent";

const result = await buildPersona(customerNotes, {
  provider: new MockProvider("rich"),  // or "sparse", "conflicting"
});

console.log(result.persona.profile.jobTitle);  // Array of field items
console.log(result.gaps);                       // Missing information
console.log(result.conflicts);                  // Competing claims
```

### Production (with real LLM)

```typescript
// Requires OPENAI_API_KEY or configured provider
const result = await buildPersona(customerNotes);
```

---

## Field Structure

Each field item has this shape:

```typescript
{
  value: "Time constraints",                 // The claim
  status: "stated" | "inferred" | "missing" | "conflicting",
  confidence: "high" | "medium" | "low",
  evidence: [{ quote: "...", source: "..." }],  // If stated
  reasoning: "..."                           // If inferred
}
```

---

## The Three Test Inputs

### Sparse Input
```
We mostly sell to marketing managers at mid-size SaaS companies.
They're busy, don't have big budgets, and hate long sales calls.
```

**Use with:** `MockProvider("sparse")`  
**Expected:** Many gaps, few inferences, clear constraints  
**Test:** Gap detection, follow-up question logic

### Rich Input
```
Jordan leads demand generation at a growing software company...
[Full paragraph with concrete details]
```

**Use with:** `MockProvider("rich")`  
**Expected:** High confidence, detailed fields, minimal gaps  
**Test:** Confident extraction, strong messaging

### Conflicting Input
```
Sales: Enterprise with formal procurement
Growth: SMB with lean team
```

**Use with:** `MockProvider("conflicting")`  
**Expected:** Conflicts preserved, no silent choices  
**Test:** Conflict resolution UI, ambiguity handling

---

## Error Handling

```typescript
try {
  const result = await buildPersona(notes);
} catch (error) {
  if (error.message.includes("empty")) {
    // Input validation failed
  } else if (error.message.includes("parse")) {
    // JSON parsing failed
  } else {
    // Other error
  }
}
```

---

## Integration Points

### From Person 1 (Input)
```typescript
const notes = getUserInput();  // Plain string
const result = await buildPersona(notes, { useMockProvider: true });
```

### To Person 2 (Schema Validation)
```typescript
// Result is already validated and normalized
validatePersonaResult(result);  // Should not throw
```

### To Person 4 (UI Card)
```typescript
for (const item of result.persona.profile.jobTitle) {
  renderField(item);  // Has value, status, confidence, evidence
}

for (const gap of result.gaps) {
  showMissingField(gap);
}
```

### To Person 5 (Integration Tests)
```typescript
const sparse = await buildPersona(sparseInput, { 
  provider: new MockProvider("sparse") 
});
assert(sparse.gaps.length > 5, "Should have multiple gaps");
```

---

## File Structure

```
src/
  agent/
    buildPersona.ts     ← Main function
    provider.ts         ← LLM abstraction + MockProvider
    prompt.ts           ← Prompt engineering
    parser.ts           ← JSON parsing & normalization
    index.ts            ← Exports

docs/
  EXTRACTION.md         ← Full API reference
  EXTRACTION_EXAMPLES.ts ← 7 runnable examples
  PERSON3_SUMMARY.md    ← Implementation details
```

---

## Quick Reference

| Feature | Status | Notes |
|---------|--------|-------|
| Extract personas | ✅ | Full B2B schema |
| Track evidence | ✅ | Quotes + sources |
| Label inferences | ✅ | With reasoning |
| Identify gaps | ✅ | Listed in result |
| Preserve conflicts | ✅ | Competing claims |
| Mock provider | ✅ | Three fixtures |
| Real LLM support | 🔄 | Ready for OpenAI/Anthropic |
| Multi-provider | 🔄 | Abstraction in place |

---

## Next Steps

1. **Read** [EXTRACTION.md](./EXTRACTION.md) for complete API reference
2. **Run** [EXTRACTION_EXAMPLES.ts](./EXTRACTION_EXAMPLES.ts) for live examples
3. **Test** [extraction.test.ts](../tests/integration/extraction.test.ts) with all three scenarios
4. **Integrate** with Person 1's input component using `buildPersona()`
5. **Connect** to Person 4's card rendering with `result.persona` and `result.messaging`
6. **Validate** with Person 2's schema validator
7. **Test** with Person 5's integration suite

---

## Support

- **API Reference:** [EXTRACTION.md](./EXTRACTION.md)
- **Examples:** [EXTRACTION_EXAMPLES.ts](./EXTRACTION_EXAMPLES.ts)
- **Implementation:** [PERSON3_SUMMARY.md](./PERSON3_SUMMARY.md)
- **Pull Request:** Link to PR description
- **Test Scenarios:** [extraction.test.ts](../tests/integration/extraction.test.ts)

---

## Common Questions

**Q: Can I use this in production without an API key?**  
A: Yes! `MockProvider` works without any configuration. For real extraction, you'll need to configure an LLM provider (OpenAI, Anthropic, etc.).

**Q: What if the LLM returns invalid JSON?**  
A: The parser is resilient to common failures (markdown code fences, commentary, etc.) and will throw a clear error if it can't recover.

**Q: How do I add a new LLM provider?**  
A: Implement the `LLMProvider` interface and pass it as an option: `buildPersona(notes, { provider: myProvider })`.

**Q: Why does it mark things as "missing" instead of guessing?**  
A: Because the whole point is to be honest about what we know. Fabricating details undermines trust and leads to bad messaging decisions.

**Q: Can I see why something was marked as "inferred"?**  
A: Yes! Inferred items include a `reasoning` field explaining the interpretation.

**Q: What if the input has conflicting claims?**  
A: The result includes a `conflicts` array preserving all competing claims with their sources. It's up to the human to decide.

---

## Implementation Status

✅ **Complete:**
- Core extraction pipeline
- Provider abstraction
- Prompt engineering
- JSON parser & normalization
- B2B persona schema
- Evidence tracking
- Mock provider with three fixtures
- Error handling
- Tests & documentation

🔄 **Ready for Integration:**
- Person 1: Input component
- Person 2: Schema validation
- Person 4: UI card rendering
- Person 5: Integration tests

---

**Ready to build?** Start with [EXTRACTION_EXAMPLES.ts](./EXTRACTION_EXAMPLES.ts) or jump into the full [EXTRACTION.md](./EXTRACTION.md) guide.

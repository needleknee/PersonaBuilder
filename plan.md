# Persona Builder - Team Collaboration Plan

## Goal

Build an AI-powered Persona Builder that transforms messy customer notes into a structured, traceable, and shareable persona card.

The solution must:

- Accept plain-text input
- Extract persona attributes
- Distinguish between:
  - Stated facts
  - AI inferences
  - Missing information
  - Conflicting information
- Generate messaging guidance
- Produce a visually structured persona card
- Support repeated testing with multiple inputs

---

# Collaboration Philosophy

The goal is to maximize parallel work.

Nobody should be blocked waiting for another team member.

Every contributor should be productive within the first few minutes.

To achieve this:

- Freeze interfaces on Day 1
- Use mock data everywhere
- Integrate late
- Avoid shared ownership of files
- Develop against fixtures, not live implementations

---

# Team Structure

## Person 1 - Input Experience

### Branch

```text
feature/input-experience
```

### Owns

```text
src/pages/
src/components/Input/
```

### Responsibilities

Build everything required to submit customer notes.

### Deliverables

- Plain text input field
- Submit button
- Reset button
- Example selector
- Loading state
- Error state

### Required Features

#### Custom Input

User can paste arbitrary notes.

#### Sample Inputs

Provide buttons for:

- Sparse input
- Rich input
- Conflicting input

#### Validation

Reject:

```text
""
```

and

```text
"     "
```

with useful feedback.

### Uses

Mock response data only.

No dependency on AI implementation.

### Acceptance Criteria

- User can enter text
- User can choose examples
- Submit flow works with mock data
- Reset clears state

---

# Person 2 - Persona Card UI

### Branch

```text
feature/persona-card-ui
```

### Owns

```text
src/components/PersonaCard/
```

### Responsibilities

Create the final persona presentation experience.

### Deliverables

Sections for:

- Archetype
- Role
- Goals
- Pain Points
- Objections
- Preferred Channels
- Buying Triggers
- Messaging Guidance
- Gaps
- Conflicts

### Status Labels

Display:

```text
STATED
INFERRED
MISSING
CONFLICTING
```

visually and consistently.

### Evidence Display

Allow users to inspect supporting evidence.

Example:

```text
Pain Point:
"Dislikes lengthy sales processes"

Evidence:
"They're busy and hate long sales calls."
```

### Uses

Static JSON fixture only.

No dependency on extraction engine.

### Acceptance Criteria

- Renders a complete persona from fixture data
- Displays all statuses
- Displays evidence
- Handles long content safely
- Has loading and error states

---

# Person 3 - AI Extraction Engine

### Branch

```text
feature-ai-extraction
```

### Owns

```text
src/agent/
```

### Responsibilities

Convert raw text into structured persona data.

### Deliverables

```typescript
buildPersona(rawInput: string): Promise<PersonaResult>
```

### Responsibilities

Extract:

- Archetype
- Role
- Goals
- Pain Points
- Objections
- Preferred Channels
- Buying Triggers

Generate:

- Messaging recommendations
- Summary

Identify:

- Inferences
- Gaps
- Contradictions

### Prompt Rules

The model must:

- Treat customer input as evidence
- Never invent customers
- Never invent companies
- Never invent statistics
- Label inferences clearly
- Preserve ambiguity
- Flag uncertainty

### Required Output

Must follow the shared contract exactly.

### Uses

Can develop entirely using:

```text
input -> JSON
```

tests.

No UI dependency.

### Acceptance Criteria

Sparse input should produce:

- Multiple gaps
- Limited inference

Rich input should produce:

- More complete persona
- Strong evidence traceability

Conflicting input should produce:

- Visible conflict output

---

# Person 4 - Schema & Validation

### Branch

```text
feature-schema-validation
```

### Owns

```text
src/schema/
```

### Responsibilities

Define and validate the shared contract.

### Deliverables

- Runtime validation
- Type definitions
- Normalization utilities
- JSON fixtures
- Unit tests

### Required Validation Rules

#### Stated

Must include evidence.

#### Inferred

Must include reasoning.

#### Missing

Cannot contain fabricated values.

#### Conflicting

Must preserve competing claims.

### Create

```text
valid-result.json
invalid-result.json
mock-result.json
```

fixtures.

### Acceptance Criteria

- Invalid status is rejected
- Missing evidence fails validation
- Invalid contract fails validation
- Output becomes predictable for UI

### Uses

Only JSON fixtures.

No dependency on UI or AI.

---

# Person 5 - Analysis Engine

### Branch

```text
feature-analysis-engine
```

### Owns

```text
src/analysis/
```

### Responsibilities

Build the trust layer.

This is the feature that differentiates the solution from a typical AI-generated persona.

### Deliverables

#### Evidence Processor

Associate findings with source text.

#### Gap Detector

Identify missing information.

Example:

```text
Preferred Channels:
Not present in input.
```

#### Conflict Detector

Identify competing claims.

Example:

```text
Sales:
Enterprise buyer

Growth:
SMB buyer
```

#### Confidence Helper

Return:

```text
high
medium
low
```

confidence levels.

### Acceptance Criteria

- Conflicts preserved
- Missing information surfaced
- Confidence calculated consistently
- Evidence references available

### Uses

Can be developed entirely from fixtures.

No dependency on AI or UI.

---

# Shared Contract (Frozen Day 1)

Nobody changes this during the event.

```typescript
type PersonaResult = {
  persona: {
    archetype: Field[];
    role: Field[];
    goals: Field[];
    painPoints: Field[];
    objections: Field[];
    preferredChannels: Field[];
    buyingTriggers: Field[];
  };

  messaging: {
    tone: Field[];
    leadWith: Field[];
    supportingPoints: Field[];
    avoid: Field[];
  };

  gaps: Gap[];

  conflicts: Conflict[];

  summary: string;
};

type Field = {
  value: string;
  status:
    | "stated"
    | "inferred"
    | "missing"
    | "conflicting";

  confidence:
    | "high"
    | "medium"
    | "low";

  evidence?: Evidence[];

  reasoning?: string;
};

type Evidence = {
  quote: string;
  source: string;
};

type Gap = {
  field: string;
  reason: string;
};

type Conflict = {
  field: string;
  competingClaims: {
    value: string;
    source: string;
  }[];
};
```

---

# Repository Layout

```text
src/

pages/
  Home/
    Person 1

components/
  Input/
    Person 1

  PersonaCard/
    Person 2

agent/
  buildPersona.ts
    Person 3

schema/
  personaSchema.ts
    Person 4

analysis/
  evidence.ts
  conflicts.ts
  gaps.ts
  confidence.ts
    Person 5

fixtures/
  sparse.txt
  rich.txt
  conflicting.txt

  valid-result.json
  invalid-result.json
  mock-result.json
```

This structure minimizes merge conflicts.

---

# Test Inputs

## Sparse Input

```text
We mostly sell to marketing managers at mid-size SaaS companies.
They're busy, don't have big budgets,
and hate long sales calls.
```

Expected outcome:

- Several gaps
- Few inferences
- Strong evidence links

---

## Rich Input

```text
Jordan leads demand generation at a growing software company and is responsible for launching campaigns with a small team.

Last month, their current planning tool forced them to copy customer insights manually into every campaign brief, which delayed a product launch.

Jordan almost rejected our product because the first demo looked difficult to configure.

They ultimately chose it after seeing that their team could turn existing interview notes into a usable campaign brief without additional research or a long onboarding project.
```

Expected outcome:

- Rich persona
- Strong evidence
- Few gaps

---

## Conflicting Input

```text
Sales:
Our ideal customer is an enterprise marketing organization with a formal procurement process and multiple regional teams.

Growth:
Our ideal customer is a small or mid-size business with a lean marketing team that can buy and adopt tools quickly.
```

Expected outcome:

- Visible conflict section
- No silent resolution
- Both positions preserved

---

# Integration Strategy

## Phase 1 - Independent Development

Everyone starts immediately.

No waiting.

No integration.

Use fixtures and mocks.

---

## Phase 2 - Shared Contract Merge

Merge only:

```text
schema/
fixtures/
```

These become the source of truth.

---

## Phase 3 - Wiring

Connect components.

```text
Input UI
    ↓
buildPersona()
    ↓
Validation
    ↓
Analysis
    ↓
Persona Card
```

---

## Phase 4 - Polish

Improve:

- Visual design
- Prompt quality
- Export options
- Error handling

---

# Session Timeline

## First 15 Minutes

- Create GitHub issues
- Assign owners
- Freeze schema
- Confirm tech stack
- Confirm AI provider

---

## Next 60–90 Minutes

Everyone works independently.

No integration required.

Use mocks and fixtures.

---

## Next 30 Minutes

Merge:

- Schema
- Fixtures
- UI
- Agent
- Analysis

Run all three test inputs.

---

## Final 15 Minutes

- Demo rehearsal
- Fix blockers only
- Final merge

---

# Definition of Done

- [ ] Accepts arbitrary text input
- [ ] Produces structured persona
- [ ] Distinguishes stated vs inferred content
- [ ] Preserves conflicts
- [ ] Surfaces gaps
- [ ] Includes evidence
- [ ] Generates messaging guidance
- [ ] Supports all three challenge inputs
- [ ] Displays a visually structured persona card
- [ ] Can be rerun repeatedly during the session
- [ ] Runs from README instructions
- [ ] Contains no secrets

---

# Stretch Goals

Only attempt after the main solution works.

- Follow-up questions for missing data
- Markdown export
- PDF export
- JSON export
- Compare two personas
- Editable inference review
- Confidence dashboard
- Multiple AI providers
- Persona history

---

# Golden Rule

**If another feature is not ready, continue using fixtures and mocks instead of waiting.**

The objective is maximum parallel development, minimum coordination overhead, and a working demo before the session ends.

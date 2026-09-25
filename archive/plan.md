# Persona Builder - B2B Marketing Persona Builder

## Goal

Build an AI-powered **B2B Marketing Persona Builder** that transforms messy customer notes into a structured, traceable, and shareable buyer persona card.

The tool helps marketing teams answer:

- Who are we targeting?
- What business outcomes are they trying to achieve?
- What challenges are preventing success?
- What objections might they have?
- What buying signals should we watch for?
- How should we position our solution?
- What messages are most likely to resonate?

The prototype should support common marketing use cases:

- Campaign planning
- Content strategy
- Product marketing
- Demand generation
- Sales enablement
- Messaging development

---

# Challenge Success Criteria

The solution must:

- Accept plain-text notes
- Extract persona information from messy input
- Distinguish between:
  - Stated facts
  - AI inferences
  - Missing information
  - Conflicting information
- Generate actionable B2B marketing guidance
- Produce a visually structured buyer persona card
- Support repeated testing using multiple sample inputs
- Clearly trace persona attributes back to source evidence

---

# Collaboration Philosophy

The goal is to maximize parallel work.

Nobody should be blocked waiting for another team member.

Every contributor should be productive within minutes.

To achieve this:

- Freeze interfaces immediately
- Use fixtures and mocks everywhere
- Integrate late
- Avoid shared ownership of files
- Keep pull requests small
- Develop against stable contracts, not live implementations

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

Build everything required to submit customer notes and execute persona generation.

### Deliverables

- Text input area
- Submit button
- Reset button
- Sample input selector
- Loading state
- Error state

### Required Features

#### Custom Input

User can paste arbitrary notes.

#### Sample Inputs

Provide buttons for:

- Sparse Input
- Rich Interview Input
- Conflicting Input

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

- User can enter notes
- User can choose examples
- Submit works using mock data
- Reset clears state
- Input is passed unchanged to the processing layer

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

Create the final B2B marketing persona presentation.

### Deliverables

Display sections for:

- Job Title
- Department
- Company Type
- Company Size
- Goals
- Challenges
- Success Metrics
- Buying Triggers
- Purchase Objections
- Decision-Making Role
- Preferred Channels
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

consistently throughout the UI.

### Evidence Display

Allow users to inspect supporting evidence.

Example:

```text
Challenge

Limited time for vendor evaluations

Evidence

"They're busy and hate long sales calls."
```

### Uses

Static JSON fixtures only.

No dependency on extraction engine.

### Acceptance Criteria

- Renders complete persona from fixture data
- Displays evidence
- Displays status indicators
- Handles long content gracefully
- Provides loading and error states
- Works on laptop-sized screens

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

Convert raw customer notes into structured B2B marketing personas.

### Deliverables

```typescript
buildPersona(rawInput: string): Promise<PersonaResult>
```

### Extract

- Job Title
- Department
- Company Type
- Company Size
- Business Goals
- Challenges
- Buying Triggers
- Purchase Objections
- Preferred Channels
- Decision-Making Role
- Success Metrics

### Generate

- Value Proposition
- Key Messages
- Proof Points
- Content Ideas
- Calls to Action
- Executive Summary

### Identify

- Inferences
- Gaps
- Contradictions
- Confidence levels

### Prompt Rules

The model must:

- Treat customer notes as evidence
- Never invent people
- Never invent companies
- Never invent statistics
- Label inferences clearly
- Preserve conflicts
- Surface uncertainty
- Flag missing information

### Uses

Fixture-based testing.

No UI dependency.

### Acceptance Criteria

Sparse input should produce:

- Several gaps
- Limited inference
- Strong evidence links

Rich input should produce:

- Detailed persona
- Strong evidence coverage
- Relevant messaging guidance

Conflicting input should produce:

- Explicit conflicts
- No silent resolution

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
- Schema tests
- JSON fixtures

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

### Acceptance Criteria

- Invalid status rejected
- Missing evidence rejected
- Invalid contract rejected
- Output normalized for consumers

### Uses

JSON fixtures only.

No UI or AI dependency.

---

# Person 5 - Marketing Intelligence Layer

### Branch

```text
feature-marketing-analysis
```

### Owns

```text
src/analysis/
```

### Responsibilities

Build the marketing-specific intelligence layer.

### Deliverables

#### Evidence Engine

Associate extracted findings with input evidence.

#### Gap Detection

Identify missing persona information.

Example:

```text
Decision-Making Role

Not present in the provided notes.
```

#### Conflict Detection

Identify contradictions.

Example:

```text
Sales

Enterprise buyer

Marketing

Mid-market buyer
```

#### Confidence Scoring

Return:

```text
High
Medium
Low
```

#### Buying Committee Detection

Identify likely role:

```text
Decision Maker
Champion
Influencer
Evaluator
Budget Owner
```

#### Funnel Stage Detection

Identify likely buying stage:

```text
Problem Aware
Solution Aware
Vendor Evaluation
Purchase Decision
Customer
```

#### Content Preference Detection

Detect evidence for:

```text
Blogs
Webinars
Case Studies
Product Demos
Peer Recommendations
Analyst Reports
```

### Acceptance Criteria

- Evidence traceability works
- Gaps are surfaced
- Conflicts preserved
- Confidence generated consistently
- Marketing-specific insights generated

### Uses

Fixtures only.

No dependency on UI or AI.

---

# Shared Contract (Frozen Day 1)

Nobody changes this without team agreement.

```typescript
type PersonaResult = {
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
  funnelStage.ts
  buyingCommittee.ts
    Person 5

fixtures/

  sparse.txt
  rich.txt
  conflicting.txt

  valid-result.json
  invalid-result.json
  mock-result.json
```

---

# Test Inputs

## Sparse Input

```text
We mostly sell to marketing managers at mid-size SaaS companies.
They're busy, don't have big budgets,
and hate long sales calls.
```

### Expected Outcome

```text
Job Title
Marketing Manager

Company Type
SaaS

Company Size
Mid-size

Challenges
Limited time
Budget constraints

Objections
Long sales cycles

Gaps
Decision-making role
Success metrics
Preferred channels
Buying triggers
```

---

## Rich Interview Input

```text
Jordan leads demand generation at a growing software company and is responsible for launching campaigns with a small team.

Last month, their current planning tool forced them to copy customer insights manually into every campaign brief, which delayed a product launch.

Jordan almost rejected our product because the first demo looked difficult to configure.

They ultimately chose it after seeing that their team could turn existing interview notes into a usable campaign brief without additional research or a long onboarding project.
```

### Expected Outcome

```text
Role
Demand Generation Manager

Goal
Launch campaigns faster

Challenge
Manual work transferring insights

Buying Trigger
Campaign efficiency

Objection
Complex onboarding

Success Metric
Faster campaign execution
```

---

## Conflicting Input

```text
Sales:
Our ideal customer is an enterprise marketing organization with a formal procurement process and multiple regional teams.

Growth:
Our ideal customer is a small or mid-size business with a lean marketing team that can buy and adopt tools quickly.
```

### Expected Outcome

```text
Conflict Detected

Claim 1
Enterprise marketing organization

Claim 2
SMB / Mid-market marketing team

Status
Conflicting

Resolution
Not enough evidence to determine the correct segment
```

---

# Integration Strategy

## Phase 1 - Independent Development

Everyone starts immediately.

No integration.

Use fixtures and mocks.

---

## Phase 2 - Shared Artifacts

Merge only:

```text
schema/
fixtures/
```

These become the source of truth.

---

## Phase 3 - Integration

Connect components.

```text
Input UI
    ↓
buildPersona()
    ↓
Schema Validation
    ↓
Marketing Analysis
    ↓
Persona Card
```

---

## Phase 4 - Polish

Improve:

- Visual hierarchy
- Prompt quality
- Error handling
- Export capabilities

---

# Session Timeline

## First 15 Minutes

- Create GitHub issues
- Assign owners
- Freeze schema
- Confirm stack
- Confirm AI provider

---

## Next 60-90 Minutes

Parallel development.

No dependencies.

Use mocks.

---

## Next 30 Minutes

Merge:

- Schema
- Fixtures
- Analysis
- AI extraction
- UI

Run all test cases.

---

## Final 15 Minutes

- Demo rehearsal
- Bug fixes only
- Merge to main

---

# Definition of Done

- [ ] Accepts arbitrary customer notes
- [ ] Produces a reusable B2B marketing persona
- [ ] Identifies company and role context
- [ ] Captures goals and challenges
- [ ] Identifies buying triggers and objections
- [ ] Identifies buying committee role when possible
- [ ] Generates messaging guidance
- [ ] Distinguishes stated vs inferred claims
- [ ] Preserves conflicting evidence
- [ ] Surfaces gaps
- [ ] Supports all challenge inputs
- [ ] Produces a visually structured persona card
- [ ] Can be rerun repeatedly during the session
- [ ] Runs from documented setup instructions
- [ ] Contains no secrets

---

# Stretch Goals

Only attempt these after the primary demo works.

- ICP generation
- Multi-persona comparison
- Campaign brief generation
- Content brief generation
- Markdown export
- PDF export
- JSON export
- Editable inference review
- Confidence dashboard
- Multiple model providers
- Persona history

---

# Golden Rule

**If another feature is unavailable, continue using mocks and fixtures instead of waiting.**

The objective is maximum parallel development, minimal coordination overhead, and a complete B2B marketing persona builder demo before the session ends.

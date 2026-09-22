## Persona Builder

Build an AI agent that turns rough, messy notes about a target customer into a structured, usable persona card.

---

### Why this challenge matters

Most teams claim to have "personas," but in practice they're often a single outdated slide, a vague gut feeling, or three different versions floating around in different people's heads.

For businesses, this leads to:

- messaging that talks past the actual buyer
- campaigns and content built on assumptions instead of evidence
- sales and marketing disagreeing about who they're even selling to
- wasted effort re-explaining "who we're targeting" in every new project kickoff

In simple terms, without a shared, structured persona, every team member is aiming at a slightly different target.

---

### Your goal

By the end of the session, your team should build a prototype of an AI agent that can:

- accept messy, unstructured input about a target customer (bullet notes, a customer interview transcript excerpt, a sales call summary, or just a rough description)
- extract and structure the input into a standard persona format (e.g. name/archetype, role, goals, pain points, objections, preferred channels, buying triggers)
- flag gaps — where the input doesn't give enough information to fill a field, the tool should say so honestly rather than inventing detail
- generate a short "how to message this persona" summary (tone, angle, what to lead with)
- output a clean, shareable persona card, not just a wall of text

Important: the persona should be traceable back to the input. Where the tool infers something not explicitly stated, it should be clearly marked as an inference, not presented as a fact.

---

### Implementation rules

- The tool must work from plain text input only — no requirement to connect to a CRM or research database.
- Do not fabricate specific data points (e.g. invented statistics, made-up company names) to fill gaps — use clearly labeled placeholders or inferences instead.
- The persona template/fields should be reusable across different input types (B2B, B2C, different industries), not hardcoded to a single example.
- Output should be visually structured (card, table, or similar) — not a single unbroken paragraph.
- Keep the flow simple enough to run more than once per session, so teams can test with 2–3 different inputs.

---

### Test inputs

Use the following inputs to test your solution:

- **Sparse input:** "We mostly sell to marketing managers at mid-size SaaS companies. They're busy, don't have big budgets, and hate long sales calls."
- **Rich input:** A short customer interview excerpt (3–5 sentences) describing a specific person's role, a recent frustration with their current tool, what almost stopped them from buying, and why they ultimately chose your product.
- **Conflicting input:** Two short notes from different team members describing the "ideal customer" slightly differently (e.g. one says enterprise, one says SMB) — to test how the tool handles ambiguity.

All test sets vary in how much detail is available, so there should be a visible difference in how much the tool infers vs. how often it flags a gap.

---

### Expected outcomes

By the end of the Vibe Coding session, teams should have:

- a working prototype of an AI persona builder
- a clear flow: raw input → structured extraction → gap-flagging → persona card output
- a reusable persona template that isn't hardcoded to one test input
- a visible distinction between "stated in input" and "inferred by AI"

---

On the test inputs, teams should demonstrate:

- a structured persona card generated from the sparse input, with gaps honestly flagged rather than invented
- a richer, more confident persona card from the detailed input
- sensible handling of the conflicting input (e.g. surfacing the conflict rather than silently picking one)

---

The objective is to:

- move from "everyone has their own idea of the customer" to one shared, structured reference
- show how AI can turn messy raw notes into something usable in minutes, not a multi-week research project
- demonstrate a tool marketers could realistically use before their next campaign or content brief

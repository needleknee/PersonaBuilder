# Additional Test Inputs

Extra B2B test inputs for manually exercising `buildPersona()` beyond the three
canonical samples in `plan.md` (Sparse / Rich Interview / Conflicting). Each one
targets a specific rule from the challenge brief.

---

## 1. Ultra-minimal

Tests: gap-flagging under near-total absence of information.

```
Sells to IT directors.
```

---

## 2. Different B2B industry (manufacturing / procurement)

Tests: the persona template stays reusable outside SaaS — no hardcoded
assumptions about software buyers.

```
Our buyer is a Procurement Manager at a mid-size manufacturing plant. They found
us through an industry trade show, requested a sample batch, and switched from
their previous supplier because shipments kept arriving with incomplete
paperwork, which held up customs clearance. Price was secondary — compliance
documentation was the deciding factor. Purchases over a certain threshold need
sign-off from the Plant Director, so they're not the sole decision-maker. They
want a pilot order before committing to a standing contract.
```

---

## 3. Three-way conflict

Tests: conflict handling beyond the canonical two-source case — no silent
majority-vote resolution.

```
Product team: Our best customers are solo freelancers who need something dead simple.

Sales team: Our best customers are mid-market ops teams with 5-10 people who need
integrations.

Customer Success: Actually our most successful renewals are large enterprises with
dedicated admins who run this across multiple departments.
```

---

## 4. Fabrication temptation

Tests: the model must not invent a specific statistic or dollar figure when the
input only gives vague qualitative praise.

```
They said our tool saved them "a ton of time" and that switching was "totally worth
it." Leadership was impressed with the ROI. They're now considering expanding usage
to other teams.
```

Expected: no invented percentage or dollar amount; `successMetrics` should be
`missing` or only qualitatively `stated`, not a fabricated number.

---

## 5. Noisy shorthand / sales-call notes

Tests: extraction from unstructured bullet fragments, not clean prose.

```
- VP eng, ~200 person co
- current tool = spreadsheets, hates it
- eval'd 2 competitors already, didn't like pricing on either
- wants demo w/ real data not a sandbox
- blocker: needs security review before signing
- mentioned Q3 budget, unclear if already allocated
```

---

## 6. Off-topic / garbage input

Tests: graceful degradation on nonsense input — should not crash or hallucinate
a confident persona from noise.

```
asdkjf lorem ipsum dolor sit amet the quick brown fox jumps over the lazy dog 12345
```

---

## 7. Rich input, strong signals, minimal gaps

Control case: a detailed, well-structured B2B interview excerpt that should
produce a confident persona with few gaps and strong evidence coverage.

```
Priya is Head of Revenue Operations at a 150-person fintech company. She manages a
team of three and owns the tooling budget for her department. Her current process
involves exporting data from four different systems every Monday to build a
pipeline report, which takes most of the morning. She evaluated us after a
colleague at another fintech recommended us in a Slack community. Her main
hesitation was whether our exports would match her existing BI dashboards without
rework. She signed after a proof-of-concept showed a matching data model, and told
us she chose us over a competitor because their onboarding required a 6-week
professional-services engagement.
```

/**
 * Usage Examples for the AI Extraction Engine
 * 
 * Demonstrates common patterns for extracting personas from customer notes.
 */

import { buildPersona, MockProvider } from "../src/agent";

/**
 * Example 1: Simple extraction with mock provider (development)
 */
async function example1_basicUsage() {
  console.log("\n=== Example 1: Basic Usage ===");

  const notes = `
Jordan leads demand generation at a growing software company and is responsible 
for launching campaigns with a small team. Last month, their current planning tool 
forced them to copy customer insights manually into every campaign brief, which 
delayed a product launch.
`;

  // Extract with mock provider
  const result = await buildPersona(notes, {
    useMockProvider: true,
    mockFixtureMode: "rich",
  });

  console.log(`Persona: ${result.persona.profile.archetype[0]?.value}`);
  console.log(`Job Title: ${result.persona.profile.jobTitle[0]?.value}`);
  console.log(`Company Type: ${result.persona.profile.companyType[0]?.value}`);
  console.log(`Confidence: ${result.confidence.overall}`);
  console.log(`Summary: ${result.summary.substring(0, 100)}...`);

  return result;
}

/**
 * Example 2: Inspect evidence and reasoning
 */
async function example2_inspectEvidenceAndReasoning() {
  console.log("\n=== Example 2: Evidence & Reasoning ===");

  const notes = `
We mostly sell to marketing managers at mid-size SaaS companies.
They're busy, don't have big budgets, and hate long sales calls.
`;

  const result = await buildPersona(notes, {
    useMockProvider: true,
    mockFixtureMode: "sparse",
  });

  // Find a stated field with evidence
  const statedField = result.persona.context.challenges.find((f) => f.status === "stated");
  if (statedField && statedField.evidence) {
    console.log(`\nSTATED FIELD: ${statedField.value}`);
    console.log(`Status: ${statedField.status}`);
    console.log(`Confidence: ${statedField.confidence}`);
    console.log(`Evidence:`);
    for (const ev of statedField.evidence) {
      console.log(`  - "${ev.quote}"`);
    }
  }

  // Find an inferred field with reasoning
  const inferredField = result.persona.context.priorityDrivers.find((f) => f.status === "inferred");
  if (inferredField) {
    console.log(`\nINFERRED FIELD: ${inferredField.value}`);
    console.log(`Status: ${inferredField.status}`);
    console.log(`Confidence: ${inferredField.confidence}`);
    console.log(`Reasoning: ${inferredField.reasoning}`);
  }

  // Show gaps
  console.log(`\nGAPS (${result.gaps.length}):`);
  for (const gap of result.gaps.slice(0, 3)) {
    console.log(`  - ${gap.field}: ${gap.reason}`);
  }

  return result;
}

/**
 * Example 3: Handle conflicting input
 */
async function example3_handleConflicts() {
  console.log("\n=== Example 3: Handling Conflicts ===");

  const notes = `
Sales Note: Our ideal customer is an enterprise marketing organization with 
a formal procurement process and multiple regional teams.

Growth Note: Our ideal customer is a small or mid-size business with a lean 
marketing team that can buy and adopt tools quickly.
`;

  const result = await buildPersona(notes, {
    useMockProvider: true,
    mockFixtureMode: "conflicting",
  });

  if (result.conflicts.length > 0) {
    console.log(`\n${result.conflicts.length} CONFLICTS DETECTED:\n`);

    for (const conflict of result.conflicts) {
      console.log(`Field: ${conflict.field}`);
      console.log(`Competing claims:`);
      for (const claim of conflict.competingClaims) {
        console.log(`  1. "${claim.value}" (${claim.source || "unknown source"})`);
      }
      console.log();
    }

    console.log("→ Recommendation: Resolve target segment before finalizing messaging");
  }

  return result;
}

/**
 * Example 4: Conditional messaging based on confidence
 */
async function example4_messagingByConfidence() {
  console.log("\n=== Example 4: Messaging by Confidence ===");

  const notes = `
We sell to demand generation leaders at B2B SaaS companies. They need tools 
that integrate with their existing workflow and don't require extensive training.
`;

  const result = await buildPersona(notes, {
    useMockProvider: true,
    mockFixtureMode: "rich",
  });

  console.log(`Overall Confidence: ${result.confidence.overall}`);
  console.log(`Breakdown:`);
  console.log(`  ${result.confidence.statedPercentage}% stated (directly quoted)`);
  console.log(`  ${result.confidence.inferredPercentage}% inferred (reasonable interpretation)`);
  console.log(`  ${result.confidence.missingPercentage}% missing (needs follow-up)`);

  // Recommend follow-up based on confidence
  if (result.confidence.missingPercentage > 30) {
    console.log(
      "\n→ High number of gaps. Recommend follow-up interview to fill: " +
        result.gaps.map((g) => g.field).join(", ")
    );
  } else if (result.confidence.overall === "high") {
    console.log("\n→ Sufficient clarity. Ready for messaging development.");
  } else {
    console.log("\n→ Medium confidence. Consider validating key assumptions with customer.");
  }

  return result;
}

/**
 * Example 5: Use extracted messaging for content planning
 */
async function example5_messagingGuidance() {
  console.log("\n=== Example 5: Messaging Guidance ===");

  const notes = `
Marketing managers at growth-stage SaaS companies need to launch campaigns quickly 
with small teams. They're frustrated by manual data entry in their current tools 
and often use customer interview notes to inform campaign messaging.
`;

  const result = await buildPersona(notes, {
    useMockProvider: true,
    mockFixtureMode: "rich",
  });

  console.log("MESSAGING GUIDANCE FOR THIS PERSONA:\n");

  const messaging = result.messaging;

  // Value proposition
  const vp = messaging.valueProposition[0];
  console.log(`Value Proposition (${vp.status}):`);
  console.log(`  ${vp.value}\n`);

  // Key messages
  console.log(`Key Messages (${messaging.keyMessages[0].status}):`);
  for (const msg of messaging.keyMessages.slice(0, 3)) {
    console.log(`  • ${msg.value}`);
  }
  console.log();

  // Content ideas
  console.log(`Recommended Content:`);
  for (const idea of messaging.contentIdeas.slice(0, 3)) {
    console.log(`  • ${idea.value}`);
  }
  console.log();

  // CTA recommendation
  const cta = messaging.callToAction[0];
  console.log(`Recommended CTA (${cta.confidence} confidence):`);
  console.log(`  ${cta.value}`);
  if (cta.reasoning) {
    console.log(`  Reasoning: ${cta.reasoning}`);
  }

  // Messaging to avoid
  console.log(`\nMessaging to Avoid:`);
  for (const avoid of messaging.messagesToAvoid.slice(0, 2)) {
    console.log(`  ✗ ${avoid.value}`);
  }

  return result;
}

/**
 * Example 6: Error handling
 */
async function example6_errorHandling() {
  console.log("\n=== Example 6: Error Handling ===");

  // Empty input
  try {
    console.log("Attempting extraction with empty input...");
    await buildPersona("");
  } catch (error) {
    console.log(`✓ Caught error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Whitespace only
  try {
    console.log("\nAttempting extraction with whitespace only...");
    await buildPersona("   \n\n  ");
  } catch (error) {
    console.log(`✓ Caught error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Invalid type
  try {
    console.log("\nAttempting extraction with null input...");
    await buildPersona(null as any);
  } catch (error) {
    console.log(`✓ Caught error: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log(
    "\n→ All error cases handled gracefully. Use try/catch in your integration."
  );
}

/**
 * Example 7: Using different fixture modes
 */
async function example7_compareFixtures() {
  console.log("\n=== Example 7: Compare Fixture Modes ===");

  const input = "Test input for all fixtures";

  const modes: Array<"sparse" | "rich" | "conflicting"> = [
    "sparse",
    "rich",
    "conflicting",
  ];

  for (const mode of modes) {
    const result = await buildPersona(input, {
      provider: new MockProvider(mode),
    });

    console.log(`\n${mode.toUpperCase()}:`);
    console.log(`  Stated: ${result.confidence.statedPercentage}%`);
    console.log(`  Inferred: ${result.confidence.inferredPercentage}%`);
    console.log(`  Missing: ${result.confidence.missingPercentage}%`);
    console.log(`  Gaps: ${result.gaps.length}`);
    console.log(`  Conflicts: ${result.conflicts.length}`);
  }

  console.log(
    "\n→ Use different modes to test UI behavior with varying data completeness."
  );
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await example1_basicUsage();
    await example2_inspectEvidenceAndReasoning();
    await example3_handleConflicts();
    await example4_messagingByConfidence();
    await example5_messagingGuidance();
    await example6_errorHandling();
    await example7_compareFixtures();

    console.log("\n" + "=".repeat(50));
    console.log("All examples completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\nExample failed:", error);
    process.exit(1);
  }
}

// Export for individual testing
export {
  example1_basicUsage,
  example2_inspectEvidenceAndReasoning,
  example3_handleConflicts,
  example4_messagingByConfidence,
  example5_messagingGuidance,
  example6_errorHandling,
  example7_compareFixtures,
};

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}

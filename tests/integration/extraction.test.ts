/**
 * Integration tests for the extraction pipeline
 * 
 * Tests all three scenarios:
 * 1. Sparse input
 * 2. Rich input
 * 3. Conflicting input
 */

import { buildPersona } from "../src/agent/buildPersona";
import { MockProvider } from "../src/agent/provider";

/**
 * Sparse input test
 */
async function testSparseInput() {
  const input = `We mostly sell to marketing managers at mid-size SaaS companies.
They're busy, don't have big budgets,
and hate long sales calls.`;

  const result = await buildPersona(input, {
    provider: new MockProvider("sparse"),
  });

  console.log("\n=== SPARSE INPUT TEST ===");
  console.log(`Input length: ${input.length}`);
  console.log(`Job title: ${result.persona.profile.jobTitle[0]?.value}`);
  console.log(`Company type: ${result.persona.profile.companyType[0]?.value}`);
  console.log(`Gaps found: ${result.gaps.length}`);
  console.log(`Conflicts found: ${result.conflicts.length}`);
  console.log(`Overall confidence: ${result.confidence.overall}`);
  console.log(
    `Distribution: ${result.confidence.statedPercentage}% stated, ${result.confidence.inferredPercentage}% inferred, ${result.confidence.missingPercentage}% missing`
  );

  // Verify expectations
  if (result.gaps.length > 0) {
    console.log("✓ Sparse input produced gaps");
  } else {
    console.log("✗ Expected gaps for sparse input");
  }

  if (result.conflicts.length === 0) {
    console.log("✓ No conflicts in sparse input");
  }

  return result;
}

/**
 * Rich input test
 */
async function testRichInput() {
  const input = `Jordan leads demand generation at a growing software company and is responsible for launching campaigns with a small team. Last month, their current planning tool forced them to copy customer insights manually into every campaign brief, which delayed a product launch. Jordan almost rejected our product because the first demo looked difficult to configure. They ultimately chose it after seeing that their team could turn existing interview notes into a usable campaign brief without additional research or a long onboarding project.`;

  const result = await buildPersona(input, {
    provider: new MockProvider("rich"),
  });

  console.log("\n=== RICH INPUT TEST ===");
  console.log(`Input length: ${input.length}`);
  console.log(`Job title: ${result.persona.profile.jobTitle[0]?.value}`);
  console.log(`Company type: ${result.persona.profile.companyType[0]?.value}`);
  console.log(`Challenges found: ${result.persona.context.challenges.length}`);
  console.log(`Gaps found: ${result.gaps.length}`);
  console.log(`Conflicts found: ${result.conflicts.length}`);
  console.log(`Overall confidence: ${result.confidence.overall}`);
  console.log(
    `Distribution: ${result.confidence.statedPercentage}% stated, ${result.confidence.inferredPercentage}% inferred, ${result.confidence.missingPercentage}% missing`
  );

  // Verify expectations
  if (result.confidence.statedPercentage > result.confidence.missingPercentage) {
    console.log("✓ Rich input has more stated content than gaps");
  } else {
    console.log("✗ Expected rich input to have more stated content");
  }

  if (result.conflicts.length === 0) {
    console.log("✓ No conflicts in rich input");
  }

  return result;
}

/**
 * Conflicting input test
 */
async function testConflictingInput() {
  const input = `Sales: Our ideal customer is an enterprise marketing organization with a formal procurement process and multiple regional teams.

Growth: Our ideal customer is a small or mid-size business with a lean marketing team that can buy and adopt tools quickly.`;

  const result = await buildPersona(input, {
    provider: new MockProvider("conflicting"),
  });

  console.log("\n=== CONFLICTING INPUT TEST ===");
  console.log(`Input length: ${input.length}`);
  console.log(`Gaps found: ${result.gaps.length}`);
  console.log(`Conflicts found: ${result.conflicts.length}`);
  console.log(`Overall confidence: ${result.confidence.overall}`);

  // Verify expectations
  if (result.conflicts.length > 0) {
    console.log("✓ Conflicting input produced conflicts");
    for (const conflict of result.conflicts) {
      console.log(`  - ${conflict.field}: ${conflict.competingClaims.length} competing claims`);
    }
  } else {
    console.log("✗ Expected conflicts for conflicting input");
  }

  if (result.gaps.length > 0) {
    console.log(`✓ Conflicting input identified ${result.gaps.length} gaps`);
  }

  return result;
}

/**
 * Error handling test
 */
async function testErrorHandling() {
  console.log("\n=== ERROR HANDLING TEST ===");

  // Test empty input
  try {
    await buildPersona("", { useMockProvider: true });
    console.log("✗ Should have rejected empty input");
  } catch (error) {
    console.log("✓ Rejected empty input");
  }

  // Test whitespace-only input
  try {
    await buildPersona("   \n\n  ", { useMockProvider: true });
    console.log("✗ Should have rejected whitespace-only input");
  } catch (error) {
    console.log("✓ Rejected whitespace-only input");
  }

  // Test non-string input
  try {
    await buildPersona(null as any, { useMockProvider: true });
    console.log("✗ Should have rejected non-string input");
  } catch (error) {
    console.log("✓ Rejected non-string input");
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    console.log("Starting extraction pipeline tests...");

    await testSparseInput();
    await testRichInput();
    await testConflictingInput();
    await testErrorHandling();

    console.log("\n=== ALL TESTS COMPLETE ===");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runTests();
}

export { testSparseInput, testRichInput, testConflictingInput, testErrorHandling };

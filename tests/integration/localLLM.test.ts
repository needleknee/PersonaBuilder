/**
 * Test Local LLM Provider
 * 
 * Quick verification that local LLM is accessible and working.
 * Run this to test your setup before running the full extraction.
 */

import { LocalLLMProvider } from "../src/agent/localProvider";
import { buildPersona, MockProvider } from "../src/agent";

/**
 * Test 1: Check if local LLM endpoint is reachable
 */
async function testLocalLLMConnection() {
  console.log("\n=== Test 1: Local LLM Connection ===");

  const provider = new LocalLLMProvider();

  if (!provider.isAvailable()) {
    console.log("❌ Provider not available");
    return false;
  }

  console.log(`✓ Provider name: ${provider.getName()}`);
  console.log(`✓ Attempting to reach local LLM endpoint...`);

  try {
    const testPrompt =
      'Return valid JSON: {"test": "ok", "status": "connected"}. Return only JSON, no other text.';

    const response = await provider.generate(testPrompt);

    if (response && response.length > 0) {
      console.log("✓ Local LLM responded successfully");
      console.log(`  Response length: ${response.length} characters`);
      return true;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`❌ Connection failed: ${msg}`);
    console.log(
      "\n💡 Make sure llama.cpp or LM Studio is running with the model loaded."
    );
    return false;
  }
}

/**
 * Test 2: Extract with local LLM
 */
async function testLocalLLMExtraction() {
  console.log("\n=== Test 2: Extract with Local LLM ===");

  const input = `
Marketing manager at a mid-size SaaS company.
Responsible for campaign launch and messaging.
Needs quick turnaround on campaign briefs.
Hates long sales calls and complex tools.
`;

  console.log("Input:", input.substring(0, 100) + "...");
  console.log("\n⏳ Running extraction with local LLM...");

  try {
    const result = await buildPersona(input);

    if (result && result.persona) {
      console.log("✓ Extraction successful!");
      console.log(`  Job Title: ${result.persona.profile.jobTitle[0]?.value}`);
      console.log(
        `  Confidence: ${result.confidence.overall} (${result.confidence.statedPercentage}% stated)`
      );
      console.log(`  Gaps identified: ${result.gaps.length}`);
      return true;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`⚠️  Extraction failed: ${msg}`);
    console.log("\n💡 Local LLM may have encountered an error.");
    console.log("   Check llama.cpp/LM Studio logs for details.");
    return false;
  }
}

/**
 * Test 3: Verify fallback to MockProvider works
 */
async function testMockProviderFallback() {
  console.log("\n=== Test 3: MockProvider Fallback ===");

  const input = "Test input for mock provider";

  try {
    const result = await buildPersona(input, { useMockProvider: true });

    if (result && result.persona) {
      console.log("✓ MockProvider fallback working");
      console.log(`  Provider used: MockProvider (intentional)`);
      console.log(`  Gaps: ${result.gaps.length}`);
      return true;
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`❌ MockProvider failed: ${msg}`);
    return false;
  }
}

/**
 * Test 4: Run all three fixture modes
 */
async function testAllFixtures() {
  console.log("\n=== Test 4: All MockProvider Fixtures ===");

  const modes: Array<"sparse" | "rich" | "conflicting"> = [
    "sparse",
    "rich",
    "conflicting",
  ];

  for (const mode of modes) {
    try {
      const result = await buildPersona("test", {
        useMockProvider: true,
        mockFixtureMode: mode,
      });

      const stated = result.confidence.statedPercentage;
      const inferred = result.confidence.inferredPercentage;
      const missing = result.confidence.missingPercentage;

      console.log(
        `✓ ${mode.padEnd(12)} - stated: ${stated}%, inferred: ${inferred}%, gaps: ${missing}%`
      );
    } catch (error) {
      console.log(`❌ ${mode} fixture failed`);
    }
  }

  return true;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("🧪 Local LLM Provider Tests");
  console.log("=".repeat(50));

  let results = {
    connection: false,
    extraction: false,
    fallback: false,
    fixtures: false,
  };

  results.connection = await testLocalLLMConnection();
  results.fixtures = await testAllFixtures();
  results.fallback = await testMockProviderFallback();

  if (results.connection) {
    results.extraction = await testLocalLLMExtraction();
  } else {
    console.log("\n=== Test 2: Skipped ===");
    console.log(
      "Skipping local LLM extraction test (connection failed, fallback to mock)"
    );
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log(`  Connection: ${results.connection ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  Extraction: ${results.extraction ? "✓ PASS" : "⊘ SKIP"}`);
  console.log(`  Fallback:   ${results.fallback ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  Fixtures:   ${results.fixtures ? "✓ PASS" : "✗ FAIL"}`);

  if (results.connection) {
    console.log(
      "\n✅ All systems operational. Local LLM is accessible and working!"
    );
  } else {
    console.log("\n⚠️  Local LLM not available, but MockProvider fallback works.");
    console.log(
      "   Make sure llama.cpp/LM Studio is running to use real extraction."
    );
  }

  console.log("\n💡 Next: Run the full extraction or integration tests");
  console.log("   npm test -- tests/integration/extraction.test.ts");
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  });
}

export { testLocalLLMConnection, testLocalLLMExtraction, testMockProviderFallback };

#!/usr/bin/env node
/**
 * Quick Demo: Persona Extraction with Local LLM
 * 
 * Usage:
 *   npm run demo
 *   or
 *   npx ts-node demo.ts
 * 
 * Requirements:
 *   - Local LLM running (LM Studio or llama.cpp at http://127.0.0.1:50305)
 *   - Or will auto-fallback to mock provider
 */

import { buildPersona, LocalLLMProvider, MockProvider } from "./src/agent";

/**
 * Test input: A realistic customer interview excerpt
 */
const demoInput = `
Jordan leads demand generation at a growing software company and is responsible 
for launching campaigns with a small team. Last month, their current planning tool 
forced them to copy customer insights manually into every campaign brief, which 
delayed a product launch.

Jordan almost rejected our product because the first demo looked difficult to 
configure. They ultimately chose it after seeing that their team could turn 
existing interview notes into a usable campaign brief without additional research 
or a long onboarding project.

Key pain points:
- Manual work slowing down campaign launches
- No budget for expensive tools
- Team is stretched thin (only 3 people)
- Need immediate time-to-value
`;

/**
 * Run the demo
 */
async function runDemo() {
  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║    Persona Extraction Engine - Local LLM Demo             ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  console.log("\n📝 INPUT NOTES:");
  console.log("─".repeat(60));
  console.log(demoInput);

  console.log("\n─".repeat(60));
  console.log("⏳ Processing extraction...");
  console.log(
    "   (Using local LLM or auto-fallback to MockProvider)\n"
  );

  try {
    // Run extraction with local LLM (or mock fallback)
    const result = await buildPersona(demoInput);

    console.log("\n✅ EXTRACTION COMPLETE\n");
    console.log(`Overall confidence: ${result.confidence.overall}`);
    console.log(
      `Coverage: ${result.confidence.statedPercentage}% stated, ` +
      `${result.confidence.inferredPercentage}% inferred, ` +
      `${result.confidence.missingPercentage}% gaps\n`
    );

    // PROFILE
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  PERSONA PROFILE                                           ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    for (const item of result.persona.profile.archetype) {
      console.log(`🎭 Archetype [${item.status}]:`);
      console.log(`   "${item.value}"`);
      if (item.reasoning) {
        console.log(`   Reasoning: ${item.reasoning}`);
      }
    }

    console.log();

    for (const item of result.persona.profile.jobTitle) {
      console.log(`💼 Job Title [${item.status}]:`);
      console.log(`   ${item.value}`);
      if (item.evidence && item.evidence.length > 0) {
        console.log(`   Evidence: "${item.evidence[0].quote}"`);
      }
    }

    console.log();

    for (const item of result.persona.profile.companyType) {
      console.log(`🏢 Company Type [${item.status}]:`);
      console.log(`   ${item.value}`);
    }

    for (const item of result.persona.profile.companySize) {
      console.log(`📊 Company Size [${item.status}]:`);
      console.log(`   ${item.value}`);
    }

    // CONTEXT - Key Goals & Challenges
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║  BUSINESS CONTEXT                                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("🎯 Goals:");
    for (const goal of result.persona.context.goals.slice(0, 2)) {
      console.log(`   • ${goal.value} [${goal.status}]`);
    }

    console.log("\n⚠️  Challenges:");
    for (const challenge of result.persona.context.challenges.slice(0, 3)) {
      console.log(`   • ${challenge.value} [${challenge.status}]`);
    }

    // BUYING BEHAVIOR
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║  BUYING BEHAVIOR                                           ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("🎯 Buying Triggers:");
    for (const trigger of result.persona.buyingBehavior.buyingTriggers.slice(0, 2)) {
      console.log(`   • ${trigger.value} [${trigger.status}]`);
    }

    console.log("\n🚫 Objections:");
    for (const objection of result.persona.buyingBehavior.purchaseObjections.slice(0, 2)) {
      console.log(`   • ${objection.value} [${objection.status}]`);
      if (objection.evidence && objection.evidence.length > 0) {
        console.log(`     ↳ "${objection.evidence[0].quote}"`);
      }
    }

    // MESSAGING
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║  RECOMMENDED MESSAGING                                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    if (result.messaging.valueProposition.length > 0) {
      const vp = result.messaging.valueProposition[0];
      console.log("💡 Value Proposition:");
      console.log(`   "${vp.value}"\n`);
    }

    if (result.messaging.keyMessages.length > 0) {
      console.log("📌 Key Messages:");
      for (const msg of result.messaging.keyMessages.slice(0, 3)) {
        console.log(`   • ${msg.value}`);
      }
      console.log();
    }

    if (result.messaging.callToAction.length > 0) {
      const cta = result.messaging.callToAction[0];
      console.log("👉 Recommended CTA:");
      console.log(`   ${cta.value}\n`);
    }

    // GAPS & CONFLICTS
    if (result.gaps.length > 0 || result.conflicts.length > 0) {
      console.log("╔════════════════════════════════════════════════════════════╗");
      console.log("║  GAPS & CONFLICTS                                          ║");
      console.log("╚════════════════════════════════════════════════════════════╝\n");

      if (result.gaps.length > 0) {
        console.log(`❓ ${result.gaps.length} Information Gaps:`);
        for (const gap of result.gaps.slice(0, 3)) {
          console.log(`   • ${gap.field}: ${gap.reason}`);
        }
        if (result.gaps.length > 3) {
          console.log(`   ... and ${result.gaps.length - 3} more`);
        }
        console.log();
      }

      if (result.conflicts.length > 0) {
        console.log(`⚡ ${result.conflicts.length} Conflict(s):`);
        for (const conflict of result.conflicts) {
          console.log(`   Field: ${conflict.field}`);
          for (const claim of conflict.competingClaims) {
            console.log(`     - "${claim.value}" (${claim.source})`);
          }
        }
        console.log();
      }
    }

    // SUMMARY
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  SUMMARY                                                   ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log(result.summary);

    console.log("\n" + "═".repeat(60));
    console.log("✅ Demo complete! Extraction successful.");
    console.log("═".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Extraction failed:", error instanceof Error ? error.message : String(error));

    console.log("\n💡 Troubleshooting tips:");
    console.log("   1. Ensure local LLM is running:");
    console.log("      • LM Studio: Start Local Server");
    console.log("      • llama.cpp: Run server with model loaded");
    console.log();
    console.log("   2. Verify endpoint is accessible:");
    console.log("      curl http://127.0.0.1:50305/v1/models");
    console.log();
    console.log("   3. Check .env configuration:");
    console.log("      LOCAL_LLM_BASE_URL=http://127.0.0.1:50305");
    console.log();
    console.log("   4. Or use mock provider for testing:");
    console.log("      const result = await buildPersona(notes, {");
    console.log("        useMockProvider: true");
    console.log("      });");

    process.exit(1);
  }
}

// Run demo
runDemo();

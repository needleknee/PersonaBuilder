# Local LLM Integration Guide

## Overview

The AI Extraction Engine is now configured to use a **local LLM** (Gemma 4 26B) running on your machine via llama.cpp, with an OpenAI-compatible API endpoint.

**Default Configuration:**
- Endpoint: `http://127.0.0.1:50305`
- Model: Gemma 4 26B (Q4 quantization)
- No API keys required
- No external network calls

---

## Prerequisites

You need to have llama.cpp or LM Studio running with the Gemma 4 model loaded.

### Option 1: Using LM Studio (Recommended)

1. Download and install [LM Studio](https://lmstudio.ai/)
2. In LM Studio, load the model:
   - Click "Search" (magnifying glass)
   - Search for "Gemma 4" or "gemma-4-26B"
   - Look for: `lmstudio-community/gemma-4-26B-A4B-it-QAT-GGUF`
   - Click the download button (Q4 quantization recommended)
3. Once loaded, start the local server:
   - Click "Local Server" tab
   - Click "Start Server"
   - Default endpoint: `http://127.0.0.1:1234`

**Note:** LM Studio uses port 1234 by default. If you're using a different port, update `.env`:
```bash
LOCAL_LLM_BASE_URL=http://127.0.0.1:1234
```

### Option 2: Using llama.cpp Directly

If you're using llama.cpp at port 50305 (as configured in `.env`), make sure the server is running:

```bash
# Example llama.cpp server command
./server -m gemma-4-26B-A4B-it-QAT-Q4_0.gguf --port 50305 --ngl 99
```

---

## Running the Demo

### 1. Ensure Local LLM is Running

Start your llama.cpp or LM Studio server:
- **LM Studio:** Click "Local Server" → "Start Server"
- **llama.cpp:** Run your server command

Verify it's running by checking the endpoint:
```bash
curl http://127.0.0.1:50305/v1/models
# or for LM Studio
curl http://127.0.0.1:1234/v1/models
```

### 2. Run Extraction

```typescript
import { buildPersona } from "@/agent";

const notes = `
Jordan leads demand generation at a growing software company and is responsible 
for launching campaigns with a small team. They hate manual data entry and 
long sales calls. Quick time-to-value is critical.
`;

// Uses local LLM by default (from .env)
const result = await buildPersona(notes);

console.log(result.persona.profile.jobTitle);
console.log(result.gaps);
console.log(result.conflicts);
```

### 3. Integration with UI

The extraction results work seamlessly with Person 4's card component:

```typescript
<PersonaCard result={result} />
```

---

## Configuration

### Environment Variables

**`.env` (with your local setup):**
```bash
LOCAL_LLM_BASE_URL=http://127.0.0.1:50305
LOCAL_LLM_MODEL=local-model
```

**Customize if needed:**
```bash
# For LM Studio
LOCAL_LLM_BASE_URL=http://127.0.0.1:1234

# For Ollama
LOCAL_LLM_BASE_URL=http://127.0.0.1:11434/v1

# Custom port
LOCAL_LLM_BASE_URL=http://localhost:8000
```

### Override at Runtime

```typescript
import { buildPersona } from "@/agent";

const result = await buildPersona(notes, {
  localLLMConfig: {
    baseURL: "http://127.0.0.1:1234",
    temperature: 0.3,
    timeout: 300000,
  },
});
```

---

## Fallback Behavior

If the local LLM is **not available** (server not running, network error, etc.), the system will:

1. Log a warning
2. Automatically fall back to `MockProvider`
3. Return a realistic demo response

This ensures demos never break due to missing local LLM:

```typescript
// Even if local LLM is down, this won't fail
const result = await buildPersona(notes);  // Falls back to mock
```

To **force** mock provider even when local LLM is available:

```typescript
const result = await buildPersona(notes, {
  useMockProvider: true,
  mockFixtureMode: "rich",  // or "sparse", "conflicting"
});
```

---

## Performance Tips

### Temperature (Creativity vs Consistency)

Lower temperature = more consistent responses (better for structured extraction):

```typescript
localLLMConfig: {
  temperature: 0.2,  // More consistent (default: 0.3)
}
```

### Timeout

Adjust if responses are taking longer than expected:

```typescript
localLLMConfig: {
  timeout: 600000,  // 10 minutes (default: 5 minutes)
}
```

### Model Quantization

For faster inference on limited hardware:
- **Q4** (4-bit): Faster, ~5-10GB VRAM
- **Q5** (5-bit): Medium, ~10-15GB VRAM
- **Q8** (8-bit): Slower, ~20GB VRAM

Gemma 4 26B Q4 quantization is recommended for balance.

---

## Troubleshooting

### Error: "Could not connect to local LLM provider"

**Solution:** Ensure llama.cpp or LM Studio is running:

```bash
# Check if server is responding
curl http://127.0.0.1:50305/v1/models

# If curl fails, start your server
# LM Studio: Click "Local Server" → "Start Server"
# llama.cpp: Run your server command
```

### Error: "Timeout waiting for LLM response"

**Cause:** Model is too slow for your hardware or prompt is too long.

**Solutions:**
- Increase timeout:
  ```typescript
  localLLMConfig: { timeout: 600000 }
  ```
- Use a smaller model (Gemma 2 27B, Mistral 7B)
- Use a faster quantization (Q3, Q4)
- Reduce input size

### Error: "Invalid JSON response from LLM"

**Cause:** Model output format is inconsistent.

**Solutions:**
1. Try a different model (Gemma 4, Mistral, Llama)
2. Adjust temperature (lower = more consistent):
   ```typescript
   localLLMConfig: { temperature: 0.2 }
   ```
3. Fallback to MockProvider for demos:
   ```typescript
   useMockProvider: true
   ```

### Server responding but extraction is slow

**Cause:** Model is running on CPU or insufficient VRAM.

**Solutions:**
- Enable GPU acceleration:
  - **LM Studio:** Settings → GPU acceleration
  - **llama.cpp:** Use `--ngl 99` flag for full GPU offload
- Use Q4 quantization
- Increase available VRAM

---

## Testing All Three Scenarios

```typescript
import { buildPersona, MockProvider } from "@/agent";

// Scenario 1: Sparse input (use local LLM)
const sparse = await buildPersona(sparseInput);

// Scenario 2: Rich input (use local LLM)
const rich = await buildPersona(richInput);

// Scenario 3: Conflicting input (use mock for consistency)
const conflicting = await buildPersona(conflictingInput, {
  useMockProvider: true,
  mockFixtureMode: "conflicting",
});
```

---

## Demo Script

```typescript
/**
 * Demo: Local LLM Extraction
 */

import { buildPersona } from "@/agent";

async function runDemo() {
  console.log("🚀 Persona Builder Demo - Local LLM\n");

  const notes = `
Jordan leads demand generation at a growing software company with a 3-person team.
Their current workflow requires manually copying customer interview data into campaign briefs,
which takes 4-6 hours per brief and often causes campaign delays. 

Jordan evaluated our product and saw that it could automate this process in under 15 minutes.
The deal was sealed when they saw their interview notes could turn into a usable campaign
brief without any additional research or training.

Key constraints:
- Very limited time (managing team and campaigns)
- Small budget (startup stage)
- Strong preference for tools that work immediately
- Major objection: Anything requiring long sales cycles or onboarding
  `;

  console.log("📝 Input Notes:");
  console.log(notes);
  console.log("\n⏳ Extracting persona with local LLM...\n");

  try {
    const result = await buildPersona(notes);

    console.log("✅ Extraction Complete!\n");

    // Show key findings
    console.log("📊 PERSONA PROFILE:");
    result.persona.profile.jobTitle.forEach((item) => {
      console.log(`  Job Title (${item.status}): ${item.value}`);
    });
    result.persona.profile.companySize.forEach((item) => {
      console.log(`  Company Size (${item.status}): ${item.value}`);
    });

    console.log("\n🎯 CHALLENGES:");
    result.persona.context.challenges.forEach((item) => {
      console.log(`  • ${item.value} (${item.status})`);
    });

    console.log("\n💬 MESSAGING GUIDANCE:");
    result.messaging.keyMessages.forEach((msg) => {
      console.log(`  • ${msg.value}`);
    });

    console.log("\n🔍 CONFIDENCE:");
    console.log(
      `  ${result.confidence.statedPercentage}% stated, ` +
      `${result.confidence.inferredPercentage}% inferred, ` +
      `${result.confidence.missingPercentage}% gaps`
    );

    if (result.gaps.length > 0) {
      console.log("\n❓ GAPS (Follow-up questions):");
      result.gaps.slice(0, 3).forEach((gap) => {
        console.log(`  • ${gap.field}: ${gap.reason}`);
      });
    }

    if (result.conflicts.length > 0) {
      console.log("\n⚡ CONFLICTS:");
      result.conflicts.forEach((conflict) => {
        console.log(`  Field: ${conflict.field}`);
        conflict.competingClaims.forEach((claim) => {
          console.log(`    - ${claim.value} (${claim.source})`);
        });
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("connect")) {
      console.error("❌ Local LLM not available. Make sure llama.cpp/LM Studio is running!");
      console.log("\n💡 Tip: Use MockProvider for demos without local LLM:");
      console.log("   const result = await buildPersona(notes, { useMockProvider: true });");
    } else {
      console.error("❌ Error:", error instanceof Error ? error.message : String(error));
    }
  }
}

runDemo();
```

Run with:
```bash
npx ts-node demo.ts
```

---

## Next Steps

1. **Ensure local LLM is running** (LM Studio or llama.cpp)
2. **Test extraction** with the demo script
3. **Integrate with Person 1's input component** for user input
4. **Validate with Person 2's schema** 
5. **Render with Person 4's card component**
6. **Run Person 5's integration tests**

---

## Support

- **LM Studio:** https://lmstudio.ai/
- **llama.cpp:** https://github.com/ggerganov/llama.cpp
- **Gemma Model:** https://huggingface.co/collections/google/gemma-release-65d5efbccdbb814521edb3b1
- **OpenAI API Spec:** https://platform.openai.com/docs/api-reference/chat/create


/**
 * LLM Provider Abstraction
 * 
 * This interface allows pluggable LLM implementations.
 * We can implement OpenAI, Anthropic, Gemini, etc. without changing the extraction logic.
 */

/**
 * Abstract LLM Provider Interface
 */
export type LLMProvider = {
  /**
   * Generate structured output from a prompt.
   * @param prompt The system prompt and user input
   * @returns Raw string response from the model
   */
  generate(prompt: string): Promise<string>;

  /**
   * Check if provider is available and configured.
   */
  isAvailable(): boolean;

  /**
   * Get provider name for logging.
   */
  getName(): string;
};

/**
 * Provider configuration options
 */
export type ProviderConfig = {
  apiKey?: string;
  model?: string;
  baseURL?: string;
  timeout?: number;
};

/**
 * Mock Provider for development and testing
 * Returns deterministic fixture responses
 */
export class MockProvider implements LLMProvider {
  private fixtureMode: "sparse" | "rich" | "conflicting" = "sparse";

  constructor(fixtureMode: "sparse" | "rich" | "conflicting" = "sparse") {
    this.fixtureMode = fixtureMode;
  }

  async generate(prompt: string): Promise<string> {
    // Return fixture based on mode
    const fixtures = {
      sparse: this.getSparseFix(),
      rich: this.getRichFixture(),
      conflicting: this.getConflictingFixture(),
    };

    return fixtures[this.fixtureMode];
  }

  isAvailable(): boolean {
    return true;
  }

  getName(): string {
    return `MockProvider (${this.fixtureMode})`;
  }

  private getSparseFix(): string {
    return JSON.stringify({
      persona: {
        profile: {
          archetype: [{ value: "Growth Manager", status: "stated" }],
          jobTitle: [{ value: "Demand Generation Manager", status: "stated" }],
          department: [{ value: "Marketing", status: "stated" }],
          companyType: [{ value: "Software/SaaS", status: "inferred" }],
          companySize: [{ value: "50-200 employees", status: "inferred" }],
          decisionMakingRole: [{ value: "Primary budget holder", status: "stated" }],
        },
        context: {
          goals: [{ value: "Launch campaigns faster with less manual work", status: "stated" }],
          challenges: [{ value: "Manual data entry delays", status: "stated" }],
          successMetrics: [{ value: "Campaign launch time reduction", status: "inferred" }],
          currentSituation: [{ value: "Using manual planning tools", status: "stated" }],
          priorityDrivers: [{ value: "Efficiency", status: "inferred" }],
        },
        buyingBehavior: {
          buyingTriggers: [{ value: "Painful manual process", status: "stated" }],
          purchaseObjections: [{ value: "Concern about complexity", status: "stated" }],
          buyingCycle: [{ value: "Short - 2-4 weeks", status: "inferred" }],
          decisionCriteria: [{ value: "Ease of use and time savings", status: "stated" }],
          preferredChannels: [{ value: "Product demo", status: "stated" }],
          informationSources: [{ value: "Direct product experience", status: "stated" }],
        },
      },
      messaging: {
        valueProposition: [{ value: "Turn notes into briefs in minutes", status: "stated" }],
        keyMessages: [{ value: "No complex setup required", status: "inferred" }],
        proofPoints: [{ value: "Immediate time savings", status: "stated" }],
        contentIdeas: [{ value: "Case study on campaign launch efficiency", status: "inferred" }],
        callToAction: [{ value: "Start with your existing notes", status: "stated" }],
        toneAndStyle: [{ value: "Direct and practical", status: "inferred" }],
        messagesToAvoid: [{ value: "Complex feature lists", status: "inferred" }],
      },
      gaps: [
        { field: "persona.context.organizationalStructure", reason: "Not mentioned in input" },
      ],
      conflicts: [],
      summary: "Growth marketer seeking efficiency in campaign planning",
    });
  }

  private getRichFixture(): string {
    return JSON.stringify({
      persona: {
        profile: {
          archetype: [{ value: "Growth Manager", status: "stated" }],
          jobTitle: [{ value: "Demand Generation Manager", status: "stated" }],
          department: [{ value: "Marketing", status: "stated" }],
          companyType: [{ value: "Software/SaaS", status: "stated" }],
          companySize: [{ value: "50-200 employees", status: "stated" }],
          decisionMakingRole: [{ value: "Primary budget holder", status: "stated" }],
        },
        context: {
          goals: [{ value: "Launch campaigns faster with less manual work", status: "stated" }],
          challenges: [{ value: "Manual data entry delays", status: "stated" }],
          successMetrics: [{ value: "Campaign launch time reduction", status: "stated" }],
          currentSituation: [{ value: "Using manual planning tools", status: "stated" }],
          priorityDrivers: [{ value: "Efficiency", status: "stated" }],
        },
        buyingBehavior: {
          buyingTriggers: [{ value: "Painful manual process", status: "stated" }],
          purchaseObjections: [{ value: "Concern about complexity", status: "stated" }],
          buyingCycle: [{ value: "Short - 2-4 weeks", status: "stated" }],
          decisionCriteria: [{ value: "Ease of use and time savings", status: "stated" }],
          preferredChannels: [{ value: "Product demo", status: "stated" }],
          informationSources: [{ value: "Direct product experience", status: "stated" }],
        },
      },
      messaging: {
        valueProposition: [{ value: "Turn notes into briefs in minutes", status: "stated" }],
        keyMessages: [{ value: "No complex setup required", status: "stated" }],
        proofPoints: [{ value: "Immediate time savings", status: "stated" }],
        contentIdeas: [{ value: "Case study on campaign launch efficiency", status: "stated" }],
        callToAction: [{ value: "Start with your existing notes", status: "stated" }],
        toneAndStyle: [{ value: "Direct and practical", status: "stated" }],
        messagesToAvoid: [{ value: "Complex feature lists", status: "stated" }],
      },
      gaps: [],
      conflicts: [],
      summary: "Growth marketer seeking efficiency in campaign planning with high confidence",
    });
  }

  private getConflictingFixture(): string {
    return JSON.stringify({
      persona: {
        profile: {
          archetype: [{ value: "Growth Manager", status: "stated" }],
          jobTitle: [{ value: "Demand Generation Manager", status: "stated" }],
          department: [{ value: "Marketing", status: "stated" }],
          companyType: [{ value: "Software/SaaS", status: "stated" }],
          companySize: [{ value: "50-200 employees", status: "stated" }],
          decisionMakingRole: [{ value: "Primary budget holder", status: "stated" }],
        },
        context: {
          goals: [{ value: "Launch campaigns faster with less manual work", status: "stated" }],
          challenges: [{ value: "Manual data entry delays", status: "stated" }],
          successMetrics: [{ value: "Campaign launch time reduction", status: "stated" }],
          currentSituation: [{ value: "Using manual planning tools", status: "stated" }],
          priorityDrivers: [{ value: "Efficiency", status: "stated" }],
        },
        buyingBehavior: {
          buyingTriggers: [{ value: "Painful manual process", status: "stated" }],
          purchaseObjections: [{ value: "Concern about complexity", status: "stated" }],
          buyingCycle: [{ value: "Short - 2-4 weeks", status: "stated" }],
          decisionCriteria: [{ value: "Ease of use and time savings", status: "stated" }],
          preferredChannels: [{ value: "Product demo", status: "stated" }],
          informationSources: [{ value: "Direct product experience", status: "stated" }],
        },
      },
      messaging: {
        valueProposition: [{ value: "Turn notes into briefs in minutes", status: "stated" }],
        keyMessages: [{ value: "No complex setup required", status: "stated" }],
        proofPoints: [{ value: "Immediate time savings", status: "stated" }],
        contentIdeas: [{ value: "Case study on campaign launch efficiency", status: "stated" }],
        callToAction: [{ value: "Start with your existing notes", status: "stated" }],
        toneAndStyle: [{ value: "Direct and practical", status: "stated" }],
        messagesToAvoid: [{ value: "Complex feature lists", status: "stated" }],
      },
      gaps: [],
      conflicts: [
        {
          field: "persona.context.urgency",
          competingClaims: [
            { value: "Very urgent - needs immediate solution", source: "opening paragraph" },
            { value: "Can wait - exploring options", source: "closing remarks" },
          ],
        },
      ],
      summary: "Growth marketer with conflicting signals about urgency",
    });
  }
}

/**
 * Local LLM Provider
 * 
 * Communicates with a local LLM server (e.g., LM Studio, llama.cpp)
 * via OpenAI-compatible API (default: http://127.0.0.1:50305)
 */
export class LocalLLMProvider implements LLMProvider {
  private baseURL: string;
  private model: string;
  private timeout: number;

  constructor(config?: ProviderConfig) {
    this.baseURL = config?.baseURL || process.env.LOCAL_LLM_URL || "http://127.0.0.1:50305";
    this.model = config?.model || "local-model";
    this.timeout = config?.timeout || 300000; // 5 minute timeout
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that extracts structured persona information from customer notes.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Local LLM responded with status ${response.status}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in local LLM response");
      }

      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`LocalLLMProvider error: ${error.message}`);
      }
      throw error;
    }
  }

  isAvailable(): boolean {
    // We can't easily check synchronously without making a request
    // Return true and let generate() throw if unavailable
    return true;
  }

  getName(): string {
    return `LocalLLMProvider (${this.baseURL})`;
  }
}

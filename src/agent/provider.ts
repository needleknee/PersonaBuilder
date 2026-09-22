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

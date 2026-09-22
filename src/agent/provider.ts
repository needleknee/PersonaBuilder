/**
 * LLM Provider Abstraction
 * 
 * This interface allows pluggable LLM implementations.
 * We can implement OpenAI, Anthropic, Gemini, etc. without changing the extraction logic.
 */

/**
 * Abstract LLM Provider Interface
 */
export interface LLMProvider {
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
}

/**
 * Provider configuration options
 */
export interface ProviderConfig {
  apiKey?: string;
  model?: string;
  baseURL?: string;
  timeout?: number;
}

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
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    return this.getFixtureResponse();
  }

  isAvailable(): boolean {
    return true;
  }

  getName(): string {
    return `MockProvider (${this.fixtureMode})`;
  }

  private getFixtureResponse(): string {
    switch (this.fixtureMode) {
      case "rich":
        return this.richFixture();
      case "conflicting":
        return this.conflictingFixture();
      case "sparse":
      default:
        return this.sparseFixture();
    }
  }

  private sparseFixture(): string {
    return `{
  "persona": {
    "profile": {
      "archetype": [{
        "value": "Time-Constrained Marketing Manager",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Described as busy with budget constraints and sales call aversion suggests time pressure.",
        "evidence": [{
          "quote": "They're busy, don't have big budgets, and hate long sales calls."
        }]
      }],
      "jobTitle": [{
        "value": "Marketing Manager",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "We mostly sell to marketing managers"
        }]
      }],
      "department": [{
        "value": "Marketing",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Inferred from job title."
      }],
      "companyType": [{
        "value": "SaaS",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "mid-size SaaS companies"
        }]
      }],
      "companySize": [{
        "value": "Mid-market (50-500 employees estimated)",
        "status": "stated",
        "confidence": "medium",
        "evidence": [{
          "quote": "mid-size SaaS companies"
        }]
      }],
      "decisionMakingRole": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }]
    },
    "context": {
      "goals": [{
        "value": "Execute marketing campaigns efficiently",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Implied by focus on marketing managers."
      }],
      "challenges": [{
        "value": "Limited budget",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "don't have big budgets"
        }]
      }, {
        "value": "Time constraints",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "They're busy"
        }]
      }],
      "successMetrics": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }],
      "currentSituation": [{
        "value": "Using competing tools with limitations",
        "status": "inferred",
        "confidence": "low",
        "reasoning": "Implied by context but not explicitly stated."
      }],
      "priorityDrivers": [{
        "value": "Speed and cost-efficiency",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Time constraints and budget limitations are primary challenges."
      }]
    },
    "buyingBehavior": {
      "buyingTriggers": [{
        "value": "Need to reduce manual work",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Implied by time constraints."
      }],
      "purchaseObjections": [{
        "value": "Long or complex sales process",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "hate long sales calls"
        }]
      }],
      "buyingCycle": [{
        "value": "Likely 1-3 months for mid-market SaaS",
        "status": "inferred",
        "confidence": "low",
        "reasoning": "Typical B2B SaaS cycle; not explicitly stated."
      }],
      "decisionCriteria": [{
        "value": "Total cost of ownership",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Budget-conscious buyer typically evaluates TCO."
      }, {
        "value": "Quick time-to-value",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Time constraints suggest preference for fast deployment."
      }],
      "preferredChannels": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }],
      "informationSources": [{
        "value": "Peer recommendations and case studies",
        "status": "inferred",
        "confidence": "low",
        "reasoning": "Aversion to long sales calls suggests preference for self-service research."
      }]
    }
  },
  "messaging": {
    "valueProposition": [{
      "value": "Get more done with your existing team in less time",
      "status": "inferred",
      "confidence": "high",
      "reasoning": "Directly addresses stated time constraints."
    }],
    "keyMessages": [{
      "value": "Save hours every week on manual workflow tasks",
      "status": "inferred",
      "confidence": "high"
    }, {
      "value": "No complex setup or long training required",
      "status": "inferred",
      "confidence": "high"
    }, {
      "value": "Proven ROI within first month",
      "status": "inferred",
      "confidence": "medium"
    }],
    "proofPoints": [{
      "value": "Mid-market SaaS companies saving 5+ hours per week",
      "status": "inferred",
      "confidence": "low",
      "reasoning": "No specific metrics provided in input."
    }],
    "contentIdeas": [{
      "value": "ROI calculator",
      "status": "inferred",
      "confidence": "medium"
    }, {
      "value": "Quick-start guide (< 15 minutes)",
      "status": "inferred",
      "confidence": "high"
    }, {
      "value": "Case study: mid-market adoption",
      "status": "inferred",
      "confidence": "medium"
    }],
    "callToAction": [{
      "value": "Try free trial (no credit card required)",
      "status": "inferred",
      "confidence": "high",
      "reasoning": "Reduces friction for time-constrained buyers."
    }],
    "toneAndStyle": [{
      "value": "Direct, efficient, respectful of time",
      "status": "inferred",
      "confidence": "high"
    }],
    "messagesToAvoid": [{
      "value": "Long product feature lists",
      "status": "inferred",
      "confidence": "high"
    }, {
      "value": "Requests for lengthy demos or calls",
      "status": "stated",
      "confidence": "high",
      "evidence": [{
        "quote": "hate long sales calls"
      }]
    }]
  },
  "gaps": [
    {
      "field": "decisionMakingRole",
      "reason": "Input does not specify who drives purchase decisions (Marketing Manager, CMO, both, etc.)"
    },
    {
      "field": "successMetrics",
      "reason": "No KPIs or success measures defined for this persona"
    },
    {
      "field": "preferredChannels",
      "reason": "No information about how this persona prefers to be contacted"
    },
    {
      "field": "currentSituation",
      "reason": "No details about current tools, processes, or pain with existing solutions"
    },
    {
      "field": "buyingCycle",
      "reason": "No information about typical purchasing timeline"
    }
  ],
  "conflicts": [],
  "summary": "This persona represents a marketing manager at a mid-size SaaS company who is time and budget-constrained. They need efficient solutions and avoid lengthy sales cycles. The input provides clear pain points but lacks detail on decision-making authority, success metrics, and communication preferences.",
  "extractedAt": "${new Date().toISOString()}",
  "confidence": {
    "overall": "medium",
    "statedPercentage": 25,
    "inferredPercentage": 50,
    "missingPercentage": 25
  }
}`;
  }

  private richFixture(): string {
    return `{
  "persona": {
    "profile": {
      "archetype": [{
        "value": "Hands-On Demand Generation Leader",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Jordan leads demand generation and is responsible for hands-on execution."
      }],
      "jobTitle": [{
        "value": "Demand Generation Manager / Lead",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "Jordan leads demand generation"
        }]
      }],
      "department": [{
        "value": "Marketing / Demand Generation",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "leads demand generation"
        }]
      }],
      "companyType": [{
        "value": "B2B Software (SaaS inferred)",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "software company"
        }]
      }],
      "companySize": [{
        "value": "Growth-stage / Early mid-market (estimated 50-200 employees)",
        "status": "stated",
        "confidence": "medium",
        "evidence": [{
          "quote": "growing software company"
        }, {
          "quote": "small team"
        }]
      }],
      "decisionMakingRole": [{
        "value": "Hands-on executor with input on tool selection",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Directly evaluates and tests products; influences adoption decision."
      }]
    },
    "context": {
      "goals": [{
        "value": "Launch campaigns quickly with a small team",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "responsible for launching campaigns with a small team"
        }]
      }, {
        "value": "Minimize manual work in campaign preparation",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "forced them to copy customer insights manually into every campaign brief"
        }]
      }],
      "challenges": [{
        "value": "Manual data entry delays campaign launches",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "current planning tool forced them to copy customer insights manually into every campaign brief, which delayed a product launch"
        }]
      }, {
        "value": "Tool complexity and steep learning curve",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "first demo looked difficult to configure"
        }]
      }],
      "successMetrics": [{
        "value": "Campaign launch velocity",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Delayed launch is mentioned as pain point; speed is priority."
      }, {
        "value": "Team productivity with small headcount",
        "status": "inferred",
        "confidence": "high"
      }],
      "currentSituation": [{
        "value": "Using planning tool with poor manual workflow integration",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "their current planning tool"
        }]
      }, {
        "value": "Leveraging customer interview notes for campaign development",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "turn existing interview notes into a usable campaign brief"
        }]
      }],
      "priorityDrivers": [{
        "value": "Speed and ease of use",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "no additional research or a long onboarding project"
        }]
      }, {
        "value": "Team enablement and self-service capability",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Small team context and preference for quick setup indicates desire for team independence."
      }]
    },
    "buyingBehavior": {
      "buyingTriggers": [{
        "value": "Immediate operational pain (campaign delays)",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "delayed a product launch"
        }]
      }, {
        "value": "Proof of specific workflow improvement",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "They ultimately chose it after seeing that their team could turn existing interview notes into a usable campaign brief without additional research"
        }]
      }],
      "purchaseObjections": [{
        "value": "Complex configuration and steep learning curve",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "almost rejected our product because the first demo looked difficult to configure"
        }]
      }, {
        "value": "Lengthy onboarding and training requirements",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "long onboarding project"
        }]
      }],
      "buyingCycle": [{
        "value": "Short (days to 1-2 weeks) with high hands-on evaluation",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Showed demo and made decision based on immediate use case testing."
      }],
      "decisionCriteria": [{
        "value": "Demonstrable workflow improvement for specific use case",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "chose it after seeing that their team could turn existing interview notes into a usable campaign brief"
        }]
      }, {
        "value": "Low setup and adoption friction",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "no additional research or a long onboarding project"
        }]
      }],
      "preferredChannels": [{
        "value": "Product demo focused on specific workflow",
        "status": "stated",
        "confidence": "high",
        "reasoning": "Decision influenced by hands-on product demonstration."
      }],
      "informationSources": [{
        "value": "Direct product evaluation and trial",
        "status": "stated",
        "confidence": "high"
      }]
    }
  },
  "messaging": {
    "valueProposition": [{
      "value": "Turn customer insights directly into campaign briefs without manual copying or lengthy setup",
      "status": "stated",
      "confidence": "high",
      "evidence": [{
        "quote": "turn existing interview notes into a usable campaign brief without additional research or a long onboarding project"
      }]
    }],
    "keyMessages": [{
      "value": "Launch campaigns faster by eliminating manual data entry",
      "status": "stated",
      "confidence": "high"
    }, {
      "value": "Your team can get productive in minutes, not weeks",
      "status": "inferred",
      "confidence": "high",
      "reasoning": "Directly counters the 'long onboarding' objection."
    }, {
      "value": "Built for small, lean teams who need to move fast",
      "status": "stated",
      "confidence": "high"
    }, {
      "value": "Transforms customer interview notes into campaign fuel automatically",
      "status": "stated",
      "confidence": "high"
    }],
    "proofPoints": [{
      "value": "Reduced campaign brief creation time from hours to minutes",
      "status": "inferred",
      "confidence": "medium",
      "reasoning": "Implied by elimination of manual copying step."
    }, {
      "value": "Implemented by growth-stage SaaS teams",
      "status": "inferred",
      "confidence": "medium"
    }],
    "contentIdeas": [{
      "value": "Case study: How [Company] cut campaign prep time by 80%",
      "status": "inferred",
      "confidence": "high"
    }, {
      "value": "Step-by-step walkthrough: Interview notes → Campaign brief in 5 minutes",
      "status": "inferred",
      "confidence": "high"
    }, {
      "value": "Comparison guide: Manual workflow vs. automated",
      "status": "inferred",
      "confidence": "medium"
    }, {
      "value": "Webinar: Scaling demand gen with a small team",
      "status": "inferred",
      "confidence": "medium"
    }],
    "callToAction": [{
      "value": "Try free demo with your own campaign brief",
      "status": "inferred",
      "confidence": "high",
      "reasoning": "This persona is driven by workflow validation; demo must showcase their use case."
    }],
    "toneAndStyle": [{
      "value": "Action-oriented, pragmatic, focused on results",
      "status": "inferred",
      "confidence": "high"
    }],
    "messagesToAvoid": [{
      "value": "Complex feature explanations or theoretical benefits",
      "status": "inferred",
      "confidence": "high"
    }, {
      "value": "Assumption of existing 'best practice' processes",
      "status": "inferred",
      "confidence": "medium"
    }]
  },
  "gaps": [
    {
      "field": "budget",
      "reason": "No information about budget constraints or procurement process"
    },
    {
      "field": "geography",
      "reason": "No location or regional information provided"
    },
    {
      "field": "technology stack",
      "reason": "Current tech stack and integration requirements not specified"
    },
    {
      "field": "team composition",
      "reason": "While team size is mentioned as small, roles and composition are not detailed"
    }
  ],
  "conflicts": [],
  "summary": "Jordan is a hands-on Demand Generation leader at a growth-stage SaaS company with a small team. They are driven by operational efficiency and speed-to-campaign, with a strong aversion to tool complexity and lengthy onboarding. A recent campaign delay from manual data entry was a key pain point. The buying trigger was a product demo that showed clear, immediate workflow improvement. This persona values simplicity, rapid time-to-value, and tools that let small teams move fast.",
  "extractedAt": "${new Date().toISOString()}",
  "confidence": {
    "overall": "high",
    "statedPercentage": 60,
    "inferredPercentage": 35,
    "missingPercentage": 5
  }
}`;
  }

  private conflictingFixture(): string {
    return `{
  "persona": {
    "profile": {
      "archetype": [{
        "value": "Enterprise vs. SMB buyer (conflicting claims)",
        "status": "conflicting",
        "confidence": "high"
      }],
      "jobTitle": [{
        "value": "Marketing Leader / Manager",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Both enterprise and SMB would have marketing leadership."
      }],
      "department": [{
        "value": "Marketing",
        "status": "inferred",
        "confidence": "high"
      }],
      "companyType": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }],
      "companySize": [{
        "value": "Enterprise vs. SMB (CONFLICT)",
        "status": "conflicting",
        "confidence": "high"
      }],
      "decisionMakingRole": [{
        "value": "Enterprise: formal procurement and multiple stakeholders; SMB: potentially sole decision-maker",
        "status": "conflicting",
        "confidence": "high"
      }]
    },
    "context": {
      "goals": [{
        "value": "Execute coordinated marketing across multiple regions (Enterprise claim)",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "formal procurement process and multiple regional teams"
        }]
      }, {
        "value": "Quick adoption and rapid deployment (SMB claim)",
        "status": "stated",
        "confidence": "high",
        "evidence": [{
          "quote": "buy and adopt tools quickly"
        }]
      }],
      "challenges": [{
        "value": "Coordination across regions and teams",
        "status": "inferred",
        "confidence": "medium",
        "reasoning": "Implied by enterprise organizational complexity."
      }, {
        "value": "Resource and budget constraints",
        "status": "inferred",
        "confidence": "low",
        "reasoning": "Typical SMB challenge but not explicitly stated."
      }],
      "successMetrics": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }],
      "currentSituation": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }],
      "priorityDrivers": [{
        "value": "Formalized processes and compliance (Enterprise)",
        "status": "inferred",
        "confidence": "medium"
      }, {
        "value": "Speed and simplicity (SMB)",
        "status": "inferred",
        "confidence": "medium"
      }]
    },
    "buyingBehavior": {
      "buyingTriggers": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }],
      "purchaseObjections": [{
        "value": "Lengthy procurement process (Enterprise concern)",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Implied by mention of formal procurement."
      }, {
        "value": "Long onboarding or complex adoption (SMB concern)",
        "status": "inferred",
        "confidence": "high",
        "reasoning": "Implied by preference for quick adoption."
      }],
      "buyingCycle": [{
        "value": "Months (Enterprise)",
        "status": "inferred",
        "confidence": "medium"
      }, {
        "value": "Weeks (SMB)",
        "status": "inferred",
        "confidence": "medium"
      }],
      "decisionCriteria": [{
        "value": "Enterprise: compliance, security, multi-team support",
        "status": "inferred",
        "confidence": "medium"
      }, {
        "value": "SMB: ease of use, quick ROI, cost",
        "status": "inferred",
        "confidence": "medium"
      }],
      "preferredChannels": [{
        "value": "Not specified in input",
        "status": "missing",
        "confidence": "high"
      }],
      "informationSources": [{
        "value": "Formal evaluations and RFPs (Enterprise)",
        "status": "inferred",
        "confidence": "medium"
      }, {
        "value": "Self-service research and trial (SMB)",
        "status": "inferred",
        "confidence": "medium"
      }]
    }
  },
  "messaging": {
    "valueProposition": [{
      "value": "Not determinable due to conflicting target segments",
      "status": "conflicting",
      "confidence": "high"
    }],
    "keyMessages": [{
      "value": "Requires two separate messaging strategies",
      "status": "conflicting",
      "confidence": "high"
    }],
    "proofPoints": [{
      "value": "Not specified in input",
      "status": "missing",
      "confidence": "high"
    }],
    "contentIdeas": [{
      "value": "Not specified in input",
      "status": "missing",
      "confidence": "high"
    }],
    "callToAction": [{
      "value": "Not specified in input",
      "status": "missing",
      "confidence": "high"
    }],
    "toneAndStyle": [{
      "value": "Professional and formal (Enterprise) vs. Direct and approachable (SMB)",
      "status": "conflicting",
      "confidence": "high"
    }],
    "messagesToAvoid": [{
      "value": "Not specified in input",
      "status": "missing",
      "confidence": "high"
    }]
  },
  "gaps": [
    {
      "field": "target_segment",
      "reason": "CRITICAL: Sales and Growth teams have fundamentally different target accounts. This must be resolved before messaging strategy can be finalized."
    },
    {
      "field": "company_size_definition",
      "reason": "Enterprise and SMB have different operational models, procurement, and success factors."
    },
    {
      "field": "decision_process",
      "reason": "Enterprise has formal procurement; SMB is ad-hoc. This affects sales strategy significantly."
    },
    {
      "field": "success_metrics",
      "reason": "Metrics differ between enterprise (compliance, regional coordination) and SMB (speed, cost)."
    },
    {
      "field": "current_tools",
      "reason": "No information about which tools or processes each segment currently uses."
    }
  ],
  "conflicts": [
    {
      "field": "companySize",
      "competingClaims": [
        {
          "value": "Enterprise organization",
          "source": "Sales",
          "evidence": [{
            "quote": "Enterprise marketing organization with a formal procurement process and multiple regional teams"
          }]
        },
        {
          "value": "Small or mid-size business",
          "source": "Growth",
          "evidence": [{
            "quote": "small or mid-size business with a lean marketing team that can buy and adopt tools quickly"
          }]
        }
      ]
    },
    {
      "field": "buyingProcess",
      "competingClaims": [
        {
          "value": "Formal, multi-stakeholder procurement",
          "source": "Sales"
        },
        {
          "value": "Quick, self-directed adoption",
          "source": "Growth"
        }
      ]
    },
    {
      "field": "organizationalStructure",
      "competingClaims": [
        {
          "value": "Multiple regional teams requiring coordination",
          "source": "Sales"
        },
        {
          "value": "Lean team that can move independently",
          "source": "Growth"
        }
      ]
    }
  ],
  "summary": "CONFLICT DETECTED: Sales and Growth have fundamentally different target personas. Sales targets enterprise organizations with formal procurement, multiple regions, and complex decision-making. Growth targets small/mid-market companies with lean teams and quick buying cycles. These are incompatible target personas with different buying processes, objections, and messaging needs. Recommendation: Resolve this conflict explicitly. Define which segment is primary, or commit to building separate messaging and sales strategies for each segment.",
  "extractedAt": "${new Date().toISOString()}",
  "confidence": {
    "overall": "high",
    "statedPercentage": 30,
    "inferredPercentage": 40,
    "missingPercentage": 30
  }
}`;
  }
}

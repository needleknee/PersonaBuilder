# Persona Builder

An AI-powered intelligence layer that transforms messy, unstructured customer notes into structured, evidence-backed B2B buyer personas.

Unlike generic AI summaries, **Persona Builder** focuses on traceability and accuracy. It distinguishes between what was explicitly stated in your notes and what the AI has inferred, while proactively flagging missing information and conflicting claims.

## ✨ Key Features

*   **🔍 Evidence-Based Extraction**: Distinguishes between `stated` facts (with direct quotes), `inferred` interpretations, and `missing` data points.
*   **⚠️ Intelligent Gap & Conflict Detection**: Automatically surfaces areas where the input is insufficient and flags contradictory statements between different sources.
*   **💬 Actionable Messaging Guidance**: Generates specific recommendations for tone, key messages, proof points, and CTAs tailored to the extracted persona.
*   **📊 Structured Output**: Produces a visually organized persona card including job profiles, context, buying behavior, and messaging strategy.
*   **🛠 Developer Friendly**: Built with a robust TypeScript schema and includes comprehensive integration tests for the extraction engine.

## 🚀 Quick Start

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS recommended)
*   npm or yarn

### Installation

```bash
git clone <repository-url>
cd persona-builder
npm install
```

### Running Locally

**Start the development server:**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the UI.

**Run integration tests:**
```bash
npm test
```

## 🏗 Architecture Overview

The application follows a clear pipeline designed for reliability and observability:

1.  **Input Layer**: Captures raw text via a React-based interface.
2.  **Extraction Engine (`@/agent`)**: Processes text through an LLM provider (supports OpenAI, Anthropic, or Mocks for development).
3.  **Validation Layer**: Ensures the extracted data strictly adheres to the defined Persona Schema.
4.  **Insight Generation**: Analyzes the validated data to identify gaps, conflicts, and messaging opportunities.
5.  **Presentation Layer**: Renders the structured results into a highly readable Persona Card.

## 📚 Documentation

*   [**Developer Guide**](docs/EXTRACTION.md): Deep dive into the `buildPersona` API, schema definitions, and status classifications.
*   [**Setup & Configuration**](docs/LOCAL_LLM_SETUP.md): Instructions for configuring LLM providers and environment variables.
*   [**Testing Suite**](docs/TEST_INPUTS.md): Details on sample inputs used for validation and testing.

## 🤝 Contributors

This project was born from a collaborative "vibe coding" session. Although hosted on a personal account, it was a collective effort from the entire team:

*   [@ottos0308](https://github.com/ottos0308)
*   [@desiana](https://github.com/desiana)
*   [@nadezda-lebedeva](https://github.com/nadezda-lebedeva)
*   Loan Cindy Tran
## 🛠 Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Testing**: Vitest / Jest

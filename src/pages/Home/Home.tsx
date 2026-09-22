import { useState } from "react";
import { InputPanel } from "../../components/Input";
import { buildPersona } from "../../agent";
import { SAMPLE_INPUTS } from "../../components/Input/sampleInputs";
import { validateNotes } from "../../components/Input/validateNotes";
import type { PersonaResult, SampleId, SubmissionStatus } from "../../components/Input";

const SAMPLE_TEXT: Record<SampleId, string> = Object.fromEntries(
  SAMPLE_INPUTS.map((sample) => [sample.id, sample.text]),
) as Record<SampleId, string>;

export default function Home() {
  const [notes, setNotes] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState<SampleId | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PersonaResult | null>(null);

  function handleNotesChange(value: string) {
    setNotes(value);
    setSelectedSampleId(null);
    setValidationMessage(null);
  }

  function handleSelectSample(id: SampleId) {
    setNotes(SAMPLE_TEXT[id]);
    setSelectedSampleId(id);
    setValidationMessage(null);
    setErrorMessage(null);
  }

  function handleReset() {
    setNotes("");
    setSelectedSampleId(null);
    setStatus("idle");
    setValidationMessage(null);
    setErrorMessage(null);
    setResult(null);
  }

  async function handleSubmit() {
    const message = validateNotes(notes);
    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage(null);
    setErrorMessage(null);
    setResult(null);
    setStatus("loading");

    try {
      // `notes` is passed exactly as stored — never trimmed or reformatted —
      // so the processing layer receives the user's input unchanged.
      const data = await buildPersona(notes);
      setResult(data);
      setStatus("success");
      console.log("Persona generated:", data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>Persona Builder</h1>
      <p>Paste customer notes below and generate a structured B2B marketing persona.</p>

      <InputPanel
        notes={notes}
        onNotesChange={handleNotesChange}
        selectedSampleId={selectedSampleId}
        onSelectSample={handleSelectSample}
        onSubmit={handleSubmit}
        onReset={handleReset}
        status={status}
        validationMessage={validationMessage}
        errorMessage={errorMessage}
      />

      {/* Temporary placeholder for Person 2's PersonaCard. Deleted once
          <PersonaCard result={result} /> is wired in during Phase 3. */}
      {status === "success" && result && (
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Persona generated (placeholder — see console for full result)</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "1rem" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}

type SubmitResetControlsProps = {
  onSubmit: () => void;
  onReset: () => void;
  submitDisabled: boolean;
  isLoading: boolean;
};

export default function SubmitResetControls({ onSubmit, onReset, submitDisabled, isLoading }: SubmitResetControlsProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button type="button" onClick={onSubmit} disabled={submitDisabled}>
        {isLoading ? "Generating..." : "Generate Persona"}
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

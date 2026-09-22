import { SAMPLE_INPUTS, type SampleId } from "./sampleInputs";

type SampleInputButtonsProps = {
  selectedId: SampleId | null;
  onSelect: (id: SampleId) => void;
  disabled: boolean;
};

export default function SampleInputButtons({ selectedId, onSelect, disabled }: SampleInputButtonsProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {SAMPLE_INPUTS.map((sample) => (
        <button
          key={sample.id}
          type="button"
          onClick={() => onSelect(sample.id)}
          disabled={disabled}
          aria-pressed={selectedId === sample.id}
          style={{ fontWeight: selectedId === sample.id ? "bold" : "normal" }}
        >
          {sample.label}
        </button>
      ))}
    </div>
  );
}

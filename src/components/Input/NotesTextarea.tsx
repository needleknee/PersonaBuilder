type NotesTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

export default function NotesTextarea({ value, onChange, disabled }: NotesTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Paste customer notes, interview excerpts, or a rough description of your target customer..."
      rows={10}
      style={{ width: "100%", fontFamily: "inherit", fontSize: "1rem", padding: "0.75rem" }}
    />
  );
}

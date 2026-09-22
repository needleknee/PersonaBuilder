export function validateNotes(raw: string): string | null {
  if (raw.trim().length === 0) {
    return "Please enter some customer notes, or choose a sample input below.";
  }
  return null;
}

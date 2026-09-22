import ErrorBanner from "./ErrorBanner";
import LoadingIndicator from "./LoadingIndicator";
import NotesTextarea from "./NotesTextarea";
import SampleInputButtons from "./SampleInputButtons";
import SubmitResetControls from "./SubmitResetControls";
import ValidationError from "./ValidationError";
import type { SampleId } from "./sampleInputs";
import type { SubmissionStatus } from "./types";

type InputPanelProps = {
  notes: string;
  onNotesChange: (value: string) => void;
  selectedSampleId: SampleId | null;
  onSelectSample: (id: SampleId) => void;
  onSubmit: () => void;
  onReset: () => void;
  status: SubmissionStatus;
  validationMessage: string | null;
  errorMessage: string | null;
};

export default function InputPanel({
  notes,
  onNotesChange,
  selectedSampleId,
  onSelectSample,
  onSubmit,
  onReset,
  status,
  validationMessage,
  errorMessage,
}: InputPanelProps) {
  const isLoading = status === "loading";

  return (
    <div>
      <SampleInputButtons selectedId={selectedSampleId} onSelect={onSelectSample} disabled={isLoading} />
      <NotesTextarea value={notes} onChange={onNotesChange} disabled={isLoading} />
      <ValidationError message={validationMessage} />
      <SubmitResetControls onSubmit={onSubmit} onReset={onReset} submitDisabled={isLoading} isLoading={isLoading} />
      {isLoading && <LoadingIndicator />}
      {status === "error" && errorMessage && <ErrorBanner message={errorMessage} onDismiss={onReset} />}
    </div>
  );
}

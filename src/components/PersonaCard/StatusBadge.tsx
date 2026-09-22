import type { FieldStatus } from "./types";
import { STATUS_HELP, STATUS_TEXT } from "./labels";

export function StatusBadge({ status }: { status: FieldStatus }) {
  return (
    <span className={`pc-badge pc-badge--${status}`} title={STATUS_HELP[status]}>
      {STATUS_TEXT[status]}
    </span>
  );
}

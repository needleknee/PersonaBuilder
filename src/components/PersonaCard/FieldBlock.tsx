import type { Field } from "./types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  label: string;
  fields?: Field[] | null;
};

const MISSING_TEXT = "Not found in the notes";

export function FieldBlock({ label, fields }: Props) {
  // An empty or absent array is treated as MISSING, so the UI never shows a blank slot.
  const items: Field[] =
    fields && fields.length > 0 ? fields : [{ value: "", status: "missing", confidence: "low" }];

  return (
    <div className="pc-field">
      <h4 className="pc-field__label">{label}</h4>
      <ul className="pc-field__items">
        {items.map((f, i) => (
          <li key={i} className={`pc-item pc-item--${f.status}`}>
            <div className="pc-item__head">
              <span className="pc-item__value">
                {f.status === "missing" && !f.value.trim() ? MISSING_TEXT : f.value}
              </span>
              <StatusBadge status={f.status} />
            </div>

            {f.status !== "missing" && (
              <span className="pc-item__confidence">{f.confidence} confidence</span>
            )}

            {f.reasoning && <p className="pc-item__reasoning">Why: {f.reasoning}</p>}

            {f.evidence && f.evidence.length > 0 && (
              <details className="pc-evidence">
                <summary>Evidence ({f.evidence.length})</summary>
                {f.evidence.map((e, j) => (
                  <blockquote key={j} className="pc-evidence__quote">
                    <p>“{e.quote}”</p>
                    <cite>{e.source}</cite>
                  </blockquote>
                ))}
              </details>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

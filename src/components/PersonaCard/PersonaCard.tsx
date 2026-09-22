import "./PersonaCard.css";
import type { Field, FieldStatus, PersonaResult } from "./types";
import { FieldBlock } from "./FieldBlock";
import { StatusBadge } from "./StatusBadge";
import { FIELD_LABELS, MESSAGING_KEYS, PERSONA_GROUPS, STATUS_HELP, labelFor } from "./labels";

export type PersonaCardProps = {
  result?: PersonaResult | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const STATUSES: FieldStatus[] = ["stated", "inferred", "missing", "conflicting"];

// Counts one status per persona field, so the strip reads "4 of 11 fields stated".
function countStatuses(result: PersonaResult): Record<FieldStatus, number> {
  const counts: Record<FieldStatus, number> = { stated: 0, inferred: 0, missing: 0, conflicting: 0 };
  const persona = result.persona ?? ({} as PersonaResult["persona"]);
  PERSONA_GROUPS.flatMap((g) => g.keys).forEach((key) => {
    const fields: Field[] = persona[key] ?? [];
    if (fields.length === 0) counts.missing++;
    else if (fields.some((f) => f.status === "conflicting")) counts.conflicting++;
    else if (fields.some((f) => f.status === "stated")) counts.stated++;
    else if (fields.some((f) => f.status === "inferred")) counts.inferred++;
    else counts.missing++;
  });
  return counts;
}

export function PersonaCard({ result, loading, error, onRetry }: PersonaCardProps) {
  if (loading) {
    return (
      <section className="pc-root pc-state" aria-busy="true">
        <p className="pc-state__title">Building the persona from your notes…</p>
        <div className="pc-skeleton" />
        <div className="pc-skeleton pc-skeleton--short" />
        <div className="pc-skeleton" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="pc-root pc-state" role="alert">
        <p className="pc-state__title">The persona could not be built.</p>
        <p>{error}</p>
        {onRetry && (
          <button className="pc-button" onClick={onRetry}>
            Try again
          </button>
        )}
      </section>
    );
  }

  if (!result) {
    return (
      <section className="pc-root pc-state">
        <p className="pc-state__title">No persona yet</p>
        <p>Paste customer notes or pick a sample, then build the persona.</p>
      </section>
    );
  }

  const counts = countStatuses(result);
  const totalFields = PERSONA_GROUPS.reduce((n, g) => n + g.keys.length, 0);
  const persona = result.persona ?? ({} as PersonaResult["persona"]);
  const messaging = result.messaging ?? ({} as PersonaResult["messaging"]);
  const gaps = result.gaps ?? [];
  const conflicts = result.conflicts ?? [];
  const title = persona.jobTitle?.find((f) => f.status !== "missing")?.value;

  return (
    <article className="pc-root">
      <header className="pc-header">
        <h2 className="pc-title">{title || "Buyer persona"}</h2>
        {result.summary && <p className="pc-summary">{result.summary}</p>}

        <ul className="pc-strip" aria-label="How much of the persona is backed by the notes">
          {STATUSES.map((s) => (
            <li key={s} className="pc-strip__item" title={STATUS_HELP[s]}>
              <span className="pc-strip__num">{counts[s]}</span>
              <StatusBadge status={s} />
            </li>
          ))}
          <li className="pc-strip__total">of {totalFields} persona fields</li>
        </ul>
      </header>

      {conflicts.length > 0 && (
        <section className="pc-card pc-card--conflicts">
          <h3 className="pc-card__title">Conflicts to resolve</h3>
          <p className="pc-card__intro">The notes disagree. Nothing below was resolved automatically.</p>
          {conflicts.map((c, i) => (
            <div key={i} className="pc-conflict">
              <h4 className="pc-field__label">{labelFor(c.field)}</h4>
              <div className="pc-conflict__claims">
                {c.competingClaims.map((claim, j) => (
                  <div key={j} className="pc-conflict__claim">
                    <span className="pc-conflict__source">{claim.source}</span>
                    <p>{claim.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="pc-grid">
        {PERSONA_GROUPS.map((group) => (
          <section key={group.title} className="pc-card">
            <h3 className="pc-card__title">{group.title}</h3>
            {group.keys.map((key) => (
              <FieldBlock key={key} label={FIELD_LABELS[key]} fields={persona[key]} />
            ))}
          </section>
        ))}

        {Boolean(result.buyingCommittee?.length || result.funnelStage?.length) && (
          <section className="pc-card">
            <h3 className="pc-card__title">Buying context</h3>
            {result.buyingCommittee && result.buyingCommittee.length > 0 && (
              <FieldBlock label={FIELD_LABELS.buyingCommittee} fields={result.buyingCommittee} />
            )}
            {result.funnelStage && result.funnelStage.length > 0 && (
              <FieldBlock label={FIELD_LABELS.funnelStage} fields={result.funnelStage} />
            )}
          </section>
        )}
      </div>

      <section className="pc-card pc-card--messaging">
        <h3 className="pc-card__title">How to message this persona</h3>
        <div className="pc-messaging">
          {MESSAGING_KEYS.map((key) => (
            <FieldBlock key={key} label={FIELD_LABELS[key]} fields={messaging[key]} />
          ))}
        </div>
      </section>

      {gaps.length > 0 && (
        <section className="pc-card">
          <h3 className="pc-card__title">What the notes don't tell us</h3>
          <ul className="pc-gaps">
            {gaps.map((g, i) => (
              <li key={i} className="pc-gap">
                <span className="pc-gap__field">{labelFor(g.field)}</span>
                <span>{g.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export default PersonaCard;

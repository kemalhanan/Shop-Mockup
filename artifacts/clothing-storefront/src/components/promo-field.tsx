import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { findPromo, promoCodes } from '@/lib/pricing';
import { applyPromo, clearPromo, promoStore } from '@/lib/shop-store';

/** Lives inside the checkout form too, so it can't be a form of its own: it handles Enter itself. */
export function PromoField({ idPrefix }: { idPrefix: string }) {
  const promo = findPromo(promoStore.use());
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    if (applyPromo(code)) {
      setCode('');
      setError(false);
    } else {
      setError(true);
    }
  };

  if (promo) {
    return (
      <div className="promo-applied" data-testid="status-promo">
        <span><strong>{promo.code}</strong> · {promo.label}</span>
        <button type="button" aria-label={`Remove code ${promo.code}`} onClick={clearPromo} data-testid="button-remove-promo"><X size={14} aria-hidden="true" /></button>
      </div>
    );
  }

  const inputId = `${idPrefix}-promo`;
  const hintId = `${inputId}-hint`;
  return (
    <div className="promo-field">
      <label className="field-label" htmlFor={inputId}>Promo code</label>
      <div className="promo-row">
        <input
          id={inputId}
          value={code}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error}
          aria-describedby={hintId}
          onChange={(event) => {
            setCode(event.target.value);
            setError(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit(event);
          }}
          data-testid="input-promo"
        />
        <button type="button" onClick={submit} disabled={!code.trim()} data-testid="button-apply-promo">Apply</button>
      </div>
      {error
        ? <p className="field-error" id={hintId} role="alert" data-testid="error-promo">That code isn’t one we recognize.</p>
        : <p className="field-hint" id={hintId}>Preview codes: {promoCodes.map((entry) => entry.code).join(', ')}</p>}
    </div>
  );
}

import { money, TAX_RATE, type Totals } from '@/lib/pricing';

export function TotalsSummary({ totals, promoCode }: { totals: Totals; promoCode: string | null }) {
  return (
    <dl className="totals" data-testid="summary-totals">
      <div><dt>Subtotal</dt><dd data-testid="text-total-subtotal">{money(totals.subtotal, true)}</dd></div>
      {totals.discount > 0 && <div className="totals-discount"><dt>Discount{promoCode ? ` (${promoCode})` : ''}</dt><dd data-testid="text-total-discount">−{money(totals.discount, true)}</dd></div>}
      <div><dt>Shipping</dt><dd data-testid="text-total-shipping">{totals.shipping === 0 ? 'Complimentary' : money(totals.shipping, true)}</dd></div>
      <div><dt>Estimated tax ({TAX_RATE * 100}%)</dt><dd data-testid="text-total-tax">{money(totals.tax, true)}</dd></div>
      <div className="totals-grand"><dt>Total</dt><dd data-testid="text-total-grand">{money(totals.total, true)}</dd></div>
    </dl>
  );
}

import { useEffect, useMemo } from 'react';
import { type FieldError, type UseFormRegisterReturn, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Info, ShoppingBag } from 'lucide-react';
import { sizeLabel } from '@/data/products';
import { ProductImage } from '@/components/product-card';
import { PromoField } from '@/components/promo-field';
import { TotalsSummary } from '@/components/totals-summary';
import { useDocumentTitle } from '@/hooks/use-shop-navigation';
import { checkoutDraftStore, checkoutSchema, deliveryWindow, emptyCheckout, placeOrder, type CheckoutValues } from '@/lib/orders';
import { computeTotals, merchandiseTotal, money, shippingCost, shippingMethods } from '@/lib/pricing';
import { promoStore, toPricedItems, useBagLines } from '@/lib/shop-store';

const sampleDetails = {
  email: 'sam.rivera@example.com',
  phone: '(555) 010-0199',
  firstName: 'Sam',
  lastName: 'Rivera',
  line1: '18 Courtyard Lane',
  line2: '',
  city: 'Portland',
  state: 'OR',
  zip: '97205',
};

type FieldProps = {
  id: string;
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  autoComplete: string;
  type?: string;
  inputMode?: 'numeric';
  optional?: boolean;
  className?: string;
};

function Field({ id, label, registration, error, autoComplete, type = 'text', inputMode, optional = false, className = '' }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>{label}{optional && <span> · Optional</span>}</label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        aria-required={!optional}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        data-testid={`input-${id}`}
        {...registration}
      />
      {error && <p className="field-error" id={errorId} data-testid={`error-${id}`}>{error.message}</p>}
    </div>
  );
}

function CheckoutForm() {
  useDocumentTitle('Checkout');
  const [, navigate] = useLocation();
  const lines = useBagLines();
  const promoCode = promoStore.use();

  const { register, handleSubmit, watch, reset, getValues, formState: { errors } } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: { ...emptyCheckout, ...checkoutDraftStore.get() },
  });

  useEffect(() => {
    const { unsubscribe } = watch((values) => checkoutDraftStore.set({ ...values } as Record<string, string>));
    return unsubscribe;
  }, [watch]);

  const selectedMethod = watch('shippingMethod');
  const items = useMemo(() => toPricedItems(lines), [lines]);
  const subtotal = merchandiseTotal(items);
  const totals = computeTotals(items, selectedMethod, promoCode);

  const submit = (values: CheckoutValues) => {
    const order = placeOrder(values, lines, promoCode);
    navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
  };

  return (
    <div className="page checkout-page" data-testid="page-checkout">
      <header className="page-head">
        <span className="section-label">Almost yours</span>
        <h1 className="section-title">Checkout.</h1>
      </header>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit(submit)} noValidate data-testid="form-checkout">
          <button type="button" className="text-button checkout-sample" onClick={() => reset({ ...sampleDetails, shippingMethod: getValues('shippingMethod') })} data-testid="button-fill-sample">Fill in sample details</button>

          <section className="checkout-section" aria-labelledby="contact-heading">
            <h2 id="contact-heading">Contact</h2>
            <div className="field-grid">
              <Field id="email" label="Email" type="email" autoComplete="email" registration={register('email')} error={errors.email} />
              <Field id="phone" label="Phone" type="tel" autoComplete="tel" optional registration={register('phone')} error={errors.phone} />
            </div>
          </section>

          <section className="checkout-section" aria-labelledby="address-heading">
            <h2 id="address-heading">Deliver to</h2>
            <div className="field-grid">
              <Field id="firstName" label="First name" autoComplete="given-name" registration={register('firstName')} error={errors.firstName} />
              <Field id="lastName" label="Last name" autoComplete="family-name" registration={register('lastName')} error={errors.lastName} />
              <Field id="line1" label="Street address" autoComplete="address-line1" className="field-wide" registration={register('line1')} error={errors.line1} />
              <Field id="line2" label="Apartment, suite" autoComplete="address-line2" optional className="field-wide" registration={register('line2')} error={errors.line2} />
              <Field id="city" label="City" autoComplete="address-level2" className="field-wide" registration={register('city')} error={errors.city} />
              <Field id="state" label="State" autoComplete="address-level1" registration={register('state')} error={errors.state} />
              <Field id="zip" label="ZIP code" autoComplete="postal-code" inputMode="numeric" registration={register('zip')} error={errors.zip} />
            </div>
          </section>

          <fieldset className="checkout-section delivery-options">
            <legend>Delivery</legend>
            {shippingMethods.map((method) => {
              const cost = shippingCost(method, subtotal, promoCode);
              return (
                <label className="delivery-option" key={method.id}>
                  <input type="radio" value={method.id} {...register('shippingMethod')} data-testid={`radio-shipping-${method.id}`} />
                  <span className="delivery-option-text">
                    <strong>{method.label}</strong>
                    <span>Arrives {deliveryWindow(method.id)}</span>
                  </span>
                  <span className="delivery-option-price">{cost === 0 ? 'Complimentary' : money(cost, true)}</span>
                </label>
              );
            })}
          </fieldset>

          <section className="checkout-section" aria-labelledby="payment-heading">
            <h2 id="payment-heading">Payment</h2>
            <p className="preview-note" data-testid="text-payment-preview"><Info size={15} aria-hidden="true" /> Payments are switched off in this preview. We won’t ask for card details, nothing is charged, and nothing ships. Your order is saved in this browser only.</p>
          </section>

          <button type="submit" className="primary-button checkout-submit" data-testid="button-place-order">Place preview order · {money(totals.total, true)} <ArrowRight size={15} aria-hidden="true" /></button>
        </form>

        <aside className="checkout-summary" aria-label="Order summary" data-testid="panel-order-summary">
          <h2>Your order</h2>
          <ul className="summary-lines">
            {lines.map(({ product, size, quantity }) => (
              <li key={`${product.id}-${size}`} data-testid={`row-summary-${product.id}-${size}`}>
                <span className="thumb thumb-small"><ProductImage product={product} /></span>
                <span className="summary-line-text"><strong>{product.name}</strong><span>{sizeLabel(size)} · Qty {quantity}</span></span>
                <span className="item-price">{money(product.price * quantity)}</span>
              </li>
            ))}
          </ul>
          <PromoField idPrefix="checkout" />
          <TotalsSummary totals={totals} promoCode={promoCode} />
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const lines = useBagLines();

  if (lines.length === 0) {
    return (
      <div className="page" data-testid="page-checkout-empty">
        <div className="page-empty">
          <ShoppingBag size={27} strokeWidth={1.25} aria-hidden="true" />
          <h1>Your bag has room.</h1>
          <p>Add a thing or two, and checkout will be right here.</p>
          <Link className="text-link" href="/" data-testid="link-checkout-shop">Back to the shop <ArrowRight size={13} aria-hidden="true" /></Link>
        </div>
      </div>
    );
  }

  return <CheckoutForm />;
}

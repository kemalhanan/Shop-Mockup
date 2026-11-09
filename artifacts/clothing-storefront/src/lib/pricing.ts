export const FREE_SHIPPING_THRESHOLD = 150;
export const TAX_RATE = 0.08;

const wholeDollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const withCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Whole-dollar amounts drop the cents unless `exact` asks for them, as in a totals table. */
export const money = (amount: number, exact = false) =>
  (exact || !Number.isInteger(amount) ? withCents : wholeDollars).format(amount);

export type ShippingMethodId = 'standard' | 'express';

export type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  price: number;
  minDays: number;
  maxDays: number;
  /** How long after the order it leaves the packing table, in hours. */
  packHours: number;
  /** When it leaves the studio, in business days after the order. */
  shipDays: number;
};

export const shippingMethods: ShippingMethod[] = [
  { id: 'standard', label: 'Standard', price: 8, minDays: 3, maxDays: 5, packHours: 24, shipDays: 2 },
  { id: 'express', label: 'Express', price: 18, minDays: 1, maxDays: 2, packHours: 2, shipDays: 1 },
];

export const getShippingMethod = (id: string) =>
  shippingMethods.find((method) => method.id === id) ?? shippingMethods[0];

export type Promo = { code: string; label: string; percentOff?: number; freeShipping?: boolean };

export const promoCodes: Promo[] = [
  { code: 'WELCOME10', label: '10% off', percentOff: 10 },
  { code: 'FREESHIP', label: 'Complimentary standard shipping', freeShipping: true },
];

export const findPromo = (code: string | null | undefined) =>
  promoCodes.find((promo) => promo.code === code?.trim().toUpperCase());

export type PricedItem = { unitPrice: number; quantity: number };

export type Totals = { subtotal: number; discount: number; shipping: number; tax: number; total: number };

export const merchandiseTotal = (items: PricedItem[]) =>
  items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

/** Discounts don't count against the threshold, so applying a code can't make shipping cost more. */
export const qualifiesForFreeShipping = (subtotal: number, promoCode: string | null) =>
  subtotal >= FREE_SHIPPING_THRESHOLD || Boolean(findPromo(promoCode)?.freeShipping);

export function shippingCost(method: ShippingMethod, subtotal: number, promoCode: string | null) {
  return method.id === 'standard' && qualifiesForFreeShipping(subtotal, promoCode) ? 0 : method.price;
}

export function computeTotals(items: PricedItem[], methodId: string, promoCode: string | null): Totals {
  const subtotal = merchandiseTotal(items);
  const percentOff = findPromo(promoCode)?.percentOff ?? 0;

  // Work in cents so that rounding only ever happens once per line of the summary.
  const subtotalCents = subtotal * 100;
  const discountCents = Math.round((subtotalCents * percentOff) / 100);
  const shippingCents = shippingCost(getShippingMethod(methodId), subtotal, promoCode) * 100;
  const taxCents = Math.round((subtotalCents - discountCents) * TAX_RATE);

  return {
    subtotal,
    discount: discountCents / 100,
    shipping: shippingCents / 100,
    tax: taxCents / 100,
    total: (subtotalCents - discountCents + shippingCents + taxCents) / 100,
  };
}

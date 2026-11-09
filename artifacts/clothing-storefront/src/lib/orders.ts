import { addBusinessDays, addHours, format } from 'date-fns';
import { z } from 'zod';
import { computeTotals, getShippingMethod, type ShippingMethodId, type Totals } from '@/lib/pricing';
import { bagStore, promoStore, toPricedItems, type ResolvedBagLine } from '@/lib/shop-store';
import { createPersistedStore } from '@/lib/store';

export const checkoutSchema = z.object({
  email: z.string().trim().email('Enter an email address, like you@example.com.'),
  phone: z.string().trim(),
  firstName: z.string().trim().min(1, 'Enter your first name.'),
  lastName: z.string().trim().min(1, 'Enter your last name.'),
  line1: z.string().trim().min(1, 'Enter your street address.'),
  line2: z.string().trim(),
  city: z.string().trim().min(1, 'Enter your city.'),
  state: z.string().trim().min(2, 'Enter your state.'),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, 'Enter a 5-digit ZIP code.'),
  shippingMethod: z.enum(['standard', 'express']),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const emptyCheckout: CheckoutValues = {
  email: '', phone: '', firstName: '', lastName: '', line1: '', line2: '', city: '', state: '', zip: '', shippingMethod: 'standard',
};

/** Half-finished checkout details last only as long as the tab does. */
export const checkoutDraftStore = createPersistedStore<Record<string, string>>({
  key: 'good-form:checkout-draft:v1',
  kind: 'session',
  schema: z.record(z.string()),
  fallback: {},
});

const orderLineSchema = z.object({
  productId: z.string(),
  name: z.string(),
  detail: z.string(),
  size: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

const orderSchema = z.object({
  id: z.string(),
  placedAt: z.string(),
  lines: z.array(orderLineSchema),
  totals: z.object({ subtotal: z.number(), discount: z.number(), shipping: z.number(), tax: z.number(), total: z.number() }),
  promoCode: z.string().nullable(),
  shippingMethod: z.enum(['standard', 'express']),
  email: z.string(),
  phone: z.string(),
  address: z.object({ firstName: z.string(), lastName: z.string(), line1: z.string(), line2: z.string(), city: z.string(), state: z.string(), zip: z.string() }),
});

export type Order = z.infer<typeof orderSchema>;

export const ordersStore = createPersistedStore<Order[]>({ key: 'good-form:orders:v1', schema: z.array(orderSchema), fallback: [] });

function createOrderId() {
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => alphabet[byte % alphabet.length]).join('');
  return `GF-${code}`;
}

/** Records the order in this browser and empties the bag. No payment or fulfilment happens. */
export function placeOrder(values: CheckoutValues, lines: ResolvedBagLine[], promoCode: string | null): Order {
  const totals: Totals = computeTotals(toPricedItems(lines), values.shippingMethod, promoCode);
  const { email, phone, shippingMethod, ...address } = values;
  const order: Order = {
    id: createOrderId(),
    placedAt: new Date().toISOString(),
    lines: lines.map(({ product, size, quantity }) => ({
      productId: product.id, name: product.name, detail: product.detail, size, quantity, unitPrice: product.price,
    })),
    totals,
    promoCode,
    shippingMethod,
    email,
    phone,
    address,
  };

  ordersStore.set((orders) => [order, ...orders]);
  bagStore.set([]);
  promoStore.set(null);
  checkoutDraftStore.set({});
  return order;
}

const formatDay = (date: Date) => format(date, 'EEE, MMM d');

/** "Mon, Nov 16 – Wed, Nov 18" for an order placed at `from`. */
export function deliveryWindow(methodId: ShippingMethodId, from: Date = new Date()) {
  const method = getShippingMethod(methodId);
  return `${formatDay(addBusinessDays(from, method.minDays))} – ${formatDay(addBusinessDays(from, method.maxDays))}`;
}

export type TimelineStep = { label: string; date: string; done: boolean };

/** The order's progress, worked out from how long ago it was placed. */
export function orderTimeline(order: Order, now: Date = new Date()): TimelineStep[] {
  const placedAt = new Date(order.placedAt);
  const method = getShippingMethod(order.shippingMethod);
  const steps: [string, Date][] = [
    ['Order placed', placedAt],
    ['Packed in the studio', addHours(placedAt, method.packHours)],
    ['On its way', addBusinessDays(placedAt, method.shipDays)],
    ['Delivered', addBusinessDays(placedAt, method.maxDays)],
  ];
  return steps.map(([label, date]) => ({ label, date: formatDay(date), done: date <= now }));
}

export const orderStatus = (order: Order, now: Date = new Date()) =>
  orderTimeline(order, now).filter((step) => step.done).at(-1)?.label ?? 'Order placed';

export const orderItemCount = (order: Order) => order.lines.reduce((total, line) => total + line.quantity, 0);

export const formatOrderDate = (order: Order) => format(new Date(order.placedAt), 'MMMM d, yyyy');

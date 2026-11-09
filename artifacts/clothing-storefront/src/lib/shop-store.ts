import { useMemo } from 'react';
import { z } from 'zod';
import { getProduct, isSoldOut, type Product } from '@/data/products';
import { findPromo } from '@/lib/pricing';
import { createPersistedStore, createStore } from '@/lib/store';

export const MAX_LINE_QUANTITY = 10;
const MAX_RECENTLY_VIEWED = 8;

export type BagLine = { productId: string; size: string; quantity: number };
export type ResolvedBagLine = BagLine & { product: Product };

const isBuyable = (line: BagLine) => {
  const product = getProduct(line.productId);
  return Boolean(product) && product!.sizes.includes(line.size) && !isSoldOut(product!, line.size);
};

const knownProductIds = z.array(z.string()).transform((ids) => ids.filter((id) => getProduct(id)));

const bagLineSchema = z.object({ productId: z.string(), size: z.string(), quantity: z.number().int().min(1) });

export const bagStore = createPersistedStore<BagLine[]>({
  key: 'good-form:bag:v1',
  // Checked line by line, so one stale entry doesn't cost the shopper the rest of their bag.
  schema: z.array(z.unknown()).transform((entries) => entries.flatMap((entry) => {
    const line = bagLineSchema.safeParse(entry);
    return line.success && isBuyable(line.data)
      ? [{ ...line.data, quantity: Math.min(line.data.quantity, MAX_LINE_QUANTITY) }]
      : [];
  })),
  fallback: [],
});

export const savedStore = createPersistedStore<string[]>({ key: 'good-form:saved:v1', schema: knownProductIds, fallback: [] });

export const recentlyViewedStore = createPersistedStore<string[]>({ key: 'good-form:recent:v1', schema: knownProductIds, fallback: [] });

export const promoStore = createPersistedStore<string | null>({
  key: 'good-form:promo:v1',
  schema: z.string().nullable().transform((code) => findPromo(code)?.code ?? null),
  fallback: null,
});

const sameLine = (line: BagLine, productId: string, size: string) => line.productId === productId && line.size === size;

/** Returns false when the line is already at its quantity limit. */
export function addToBag(productId: string, size: string, quantity = 1) {
  const existing = bagStore.get().find((line) => sameLine(line, productId, size));
  if (existing && existing.quantity >= MAX_LINE_QUANTITY) return false;
  bagStore.set((lines) => existing
    ? lines.map((line) => sameLine(line, productId, size) ? { ...line, quantity: Math.min(line.quantity + quantity, MAX_LINE_QUANTITY) } : line)
    : [...lines, { productId, size, quantity: Math.min(quantity, MAX_LINE_QUANTITY) }]);
  return true;
}

export function changeQuantity(productId: string, size: string, delta: number) {
  bagStore.set((lines) => lines.map((line) => sameLine(line, productId, size)
    ? { ...line, quantity: Math.min(Math.max(line.quantity + delta, 1), MAX_LINE_QUANTITY) }
    : line));
}

/** Takes the line out of the bag and returns a function that puts it back where it was. */
export function removeLine(productId: string, size: string) {
  const before = bagStore.get();
  const index = before.findIndex((line) => sameLine(line, productId, size));
  const removed = before[index];
  bagStore.set(before.filter((_, position) => position !== index));
  return () => {
    bagStore.set((lines) => {
      const next = [...lines];
      next.splice(Math.min(index, lines.length), 0, removed);
      return next;
    });
  };
}

export const isSaved = (productId: string) => savedStore.get().includes(productId);

export function toggleSaved(productId: string) {
  savedStore.set((ids) => ids.includes(productId) ? ids.filter((id) => id !== productId) : [productId, ...ids]);
}

/** Saves the line for later, and returns a function that undoes both halves of the move. */
export function moveToSaved(productId: string, size: string) {
  const wasSaved = isSaved(productId);
  const restoreLine = removeLine(productId, size);
  if (!wasSaved) toggleSaved(productId);
  return () => {
    restoreLine();
    if (!wasSaved) toggleSaved(productId);
  };
}

export function recordView(productId: string) {
  if (recentlyViewedStore.get()[0] === productId) return;
  recentlyViewedStore.set((ids) => [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_RECENTLY_VIEWED));
}

/** Returns false when the code isn't recognized. */
export function applyPromo(code: string) {
  const promo = findPromo(code);
  if (!promo) return false;
  promoStore.set(promo.code);
  return true;
}

export const clearPromo = () => promoStore.set(null);

export function useBagLines(): ResolvedBagLine[] {
  const lines = bagStore.use();
  return useMemo(() => lines.flatMap((line) => {
    const product = getProduct(line.productId);
    return product ? [{ ...line, product }] : [];
  }), [lines]);
}

export const useBagCount = () => bagStore.use().reduce((total, line) => total + line.quantity, 0);

export const toPricedItems = (lines: ResolvedBagLine[]) =>
  lines.map((line) => ({ unitPrice: line.product.price, quantity: line.quantity }));

// Interface state that several parts of the page need to reach.
export const bagOpenStore = createStore(false);
export const searchOpenStore = createStore(false);

export type ToastAction = { label: string; run: () => void };
export type Toast = { id: number; message: string; action?: ToastAction };

export const toastStore = createStore<Toast | null>(null);
let toastId = 0;
let toastTimer: number | undefined;

export function dismissToast() {
  window.clearTimeout(toastTimer);
  toastStore.set(null);
}

export function showToast(message: string, action?: ToastAction) {
  window.clearTimeout(toastTimer);
  toastId += 1;
  toastStore.set({ id: toastId, message, action });
  toastTimer = window.setTimeout(() => toastStore.set(null), action ? 6000 : 2600);
}

export function openBag() {
  dismissToast();
  bagOpenStore.set(true);
}

export const closeBag = () => bagOpenStore.set(false);

/** Adds one of the product to the bag and tells the shopper how that went. */
export function addToBagWithToast(product: Product, size: string) {
  if (!addToBag(product.id, size)) {
    showToast(`Your bag already holds ${MAX_LINE_QUANTITY} of the ${product.name}, which is our limit.`, { label: 'View bag', run: openBag });
    return;
  }
  showToast(`${product.name} · ${size} added to your bag`, { label: 'View bag', run: openBag });
}

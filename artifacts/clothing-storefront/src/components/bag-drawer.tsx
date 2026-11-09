import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Check, Heart, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { sizeLabel } from '@/data/products';
import { Modal } from '@/components/modal';
import { ProductImage, productPath } from '@/components/product-card';
import { PromoField } from '@/components/promo-field';
import { computeTotals, FREE_SHIPPING_THRESHOLD, money, qualifiesForFreeShipping } from '@/lib/pricing';
import { bagOpenStore, changeQuantity, closeBag, MAX_LINE_QUANTITY, moveToSaved, promoStore, removeLine, toPricedItems, useBagCount, useBagLines, type ResolvedBagLine } from '@/lib/shop-store';

/** Toasts can't be reached while the bag is open, so the bag offers its own undo. */
type Notice = { message: string; undo: () => void };

function FreeShippingMeter({ subtotal, promoCode }: { subtotal: number; promoCode: string | null }) {
  const unlocked = qualifiesForFreeShipping(subtotal, promoCode);
  const progress = unlocked ? 100 : (subtotal / FREE_SHIPPING_THRESHOLD) * 100;
  return (
    <div className="shipping-meter" data-testid="meter-free-shipping">
      <p>{unlocked
        ? <><Check size={13} aria-hidden="true" /> Complimentary shipping is on us.</>
        : <>You’re <strong>{money(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> away from complimentary shipping.</>}</p>
      <div className="shipping-meter-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

function BagPanel() {
  const lines = useBagLines();
  const count = useBagCount();
  const promoCode = promoStore.use();
  const totals = computeTotals(toPricedItems(lines), 'standard', promoCode);
  const [notice, setNotice] = useState<Notice | null>(null);

  const remove = ({ product, size }: ResolvedBagLine) => {
    setNotice({ message: `${product.name} removed.`, undo: removeLine(product.id, size) });
  };

  const save = ({ product, size }: ResolvedBagLine) => {
    setNotice({ message: `${product.name} moved to saved.`, undo: moveToSaved(product.id, size) });
  };

  const decrease = (line: ResolvedBagLine) => {
    if (line.quantity === 1) remove(line);
    else changeQuantity(line.product.id, line.size, -1);
  };

  return (
    <Modal className="modal cart-panel" labelledBy="cart-heading" onClose={closeBag} testId="panel-cart">
      <div className="cart-header">
        <h2 id="cart-heading">Your bag <span className="section-label">({count})</span></h2>
        <button className="close-button" aria-label="Close bag" onClick={closeBag} data-testid="button-close-cart"><X size={21} /></button>
      </div>
      {notice && (
        <div className="bag-notice" role="status" data-testid="status-bag-notice">
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => {
              notice.undo();
              setNotice(null);
            }}
            data-testid="button-bag-undo"
          >
            Undo
          </button>
        </div>
      )}
      <div className="cart-content">
        {lines.length === 0 ? (
          <div className="cart-empty" data-testid="empty-cart">
            <ShoppingBag size={27} strokeWidth={1.25} />
            <p>Your bag has room.</p>
            <span>Find something you’ll reach for often.</span>
            <button className="text-link" onClick={closeBag} data-testid="button-continue-shopping">Keep looking <ArrowRight size={13} /></button>
          </div>
        ) : (
          <>
            <FreeShippingMeter subtotal={totals.subtotal} promoCode={promoCode} />
            <div className="cart-items">
              {lines.map((line) => {
                const { product, size, quantity } = line;
                return (
                  <div className="cart-item" key={`${product.id}-${size}`} data-testid={`row-cart-${product.id}-${size}`}>
                    <Link className="thumb" href={productPath(product)} onClick={closeBag} tabIndex={-1} aria-hidden="true"><ProductImage product={product} /></Link>
                    <div className="cart-item-info">
                      <Link className="cart-item-name" href={productPath(product)} onClick={closeBag}>{product.name}</Link>
                      <span>{sizeLabel(size)} · {product.detail}</span>
                      <div className="quantity-control" role="group" aria-label={`Quantity for ${product.name}`}>
                        <button aria-label={quantity === 1 ? `Remove ${product.name}` : `Decrease ${product.name} quantity`} data-testid={`button-quantity-minus-${product.id}-${size}`} onClick={() => decrease(line)}><Minus size={12} /></button>
                        <output data-testid={`text-quantity-${product.id}-${size}`}>{quantity}</output>
                        <button aria-label={`Increase ${product.name} quantity`} disabled={quantity >= MAX_LINE_QUANTITY} data-testid={`button-quantity-plus-${product.id}-${size}`} onClick={() => changeQuantity(product.id, size, 1)}><Plus size={12} /></button>
                      </div>
                    </div>
                    <div className="cart-item-side">
                      <span className="item-price">{money(product.price * quantity)}</span>
                      <button className="remove-button" data-testid={`button-remove-${product.id}-${size}`} onClick={() => remove(line)}>Remove</button>
                      <button className="remove-button" data-testid={`button-move-to-saved-${product.id}-${size}`} onClick={() => save(line)}><Heart size={10} aria-hidden="true" /> Save</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      {lines.length > 0 && (
        <div className="cart-footer">
          <PromoField idPrefix="bag" />
          {totals.discount > 0 && <div className="bag-discount"><span>Discount</span><span data-testid="text-cart-discount">−{money(totals.discount, true)}</span></div>}
          <div className="subtotal"><span>Subtotal</span><span data-testid="text-cart-subtotal">{money(totals.subtotal - totals.discount)}</span></div>
          <p className="cart-disclaimer">Shipping and estimated tax are worked out at checkout.</p>
          <Link className="primary-button checkout-button" href="/checkout" onClick={closeBag} data-testid="button-checkout">Continue to checkout <ArrowRight size={15} /></Link>
        </div>
      )}
    </Modal>
  );
}

export function BagDrawer() {
  return bagOpenStore.use() ? <BagPanel /> : null;
}

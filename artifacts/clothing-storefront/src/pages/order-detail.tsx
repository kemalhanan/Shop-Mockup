import { Link } from 'wouter';
import { ArrowRight, Check, Info } from 'lucide-react';
import { getProduct, isSoldOut, sizeLabel } from '@/data/products';
import { ProductImage } from '@/components/product-card';
import { TotalsSummary } from '@/components/totals-summary';
import { useDocumentTitle } from '@/hooks/use-shop-navigation';
import { deliveryWindow, formatOrderDate, orderTimeline, ordersStore, type Order } from '@/lib/orders';
import { getShippingMethod, money } from '@/lib/pricing';
import { addToBag, openBag } from '@/lib/shop-store';
import NotFound from '@/pages/not-found';

function buyAgain(order: Order) {
  order.lines.forEach((line) => {
    const product = getProduct(line.productId);
    if (product && product.sizes.includes(line.size) && !isSoldOut(product, line.size)) addToBag(line.productId, line.size, line.quantity);
  });
  openBag();
}

function OrderDetail({ order }: { order: Order }) {
  useDocumentTitle(`Order ${order.id}`);
  const justPlaced = Boolean((window.history.state as { justPlaced?: boolean } | null)?.justPlaced);
  const method = getShippingMethod(order.shippingMethod);
  const { firstName, lastName, line1, line2, city, state, zip } = order.address;

  return (
    <div className="page order-page" data-testid="page-order">
      <header className="page-head">
        <span className="section-label">{justPlaced ? `Order ${order.id}` : `Placed ${formatOrderDate(order)}`}</span>
        <h1 className="section-title" data-testid="text-order-heading">{justPlaced ? <>Thank you, {firstName}.</> : <>Order {order.id}.</>}</h1>
      </header>
      {justPlaced && <p className="preview-note" data-testid="text-order-preview"><Info size={15} aria-hidden="true" /> This is a preview order. Nothing was charged and nothing will ship, so the dates below are only for show.</p>}

      <div className="order-layout">
        <div className="order-main">
          <section className="order-section" aria-labelledby="progress-heading">
            <h2 id="progress-heading">Progress</h2>
            <ol className="order-timeline" data-testid="list-order-timeline">
              {orderTimeline(order).map((step) => (
                <li key={step.label} className={step.done ? 'done' : ''}>
                  <span className="timeline-marker" aria-hidden="true">{step.done && <Check size={11} />}</span>
                  <span className="timeline-label"><strong>{step.label}</strong><span>{step.done ? step.date : `Expected ${step.date}`}</span></span>
                </li>
              ))}
            </ol>
          </section>

          <section className="order-section" aria-labelledby="items-heading">
            <h2 id="items-heading">What’s in it</h2>
            <ul className="summary-lines">
              {order.lines.map((line) => {
                const product = getProduct(line.productId);
                return (
                  <li key={`${line.productId}-${line.size}`} data-testid={`row-order-${line.productId}-${line.size}`}>
                    <span className="thumb thumb-small">{product && <ProductImage product={product} />}</span>
                    <span className="summary-line-text">
                      {product ? <Link href={`/products/${product.id}`}><strong>{line.name}</strong></Link> : <strong>{line.name}</strong>}
                      <span>{sizeLabel(line.size)} · {line.detail} · Qty {line.quantity}</span>
                    </span>
                    <span className="item-price">{money(line.unitPrice * line.quantity)}</span>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="text-button order-again" onClick={() => buyAgain(order)} data-testid="button-buy-again">Add these to my bag again</button>
          </section>
        </div>

        <aside className="order-side">
          <section className="order-section" aria-labelledby="delivery-heading">
            <h2 id="delivery-heading">Delivery</h2>
            <p data-testid="text-order-address">{firstName} {lastName}<br />{line1}{line2 && <><br />{line2}</>}<br />{city}, {state} {zip}</p>
            <p>{method.label} · {deliveryWindow(order.shippingMethod, new Date(order.placedAt))}</p>
            <p>Updates would go to {order.email}.</p>
          </section>
          <section className="order-section" aria-labelledby="total-heading">
            <h2 id="total-heading">Total</h2>
            <TotalsSummary totals={order.totals} promoCode={order.promoCode} />
          </section>
        </aside>
      </div>

      <div className="order-links">
        <Link className="text-link" href="/orders" data-testid="link-all-orders">All your orders <ArrowRight size={13} aria-hidden="true" /></Link>
        <Link className="text-link" href="/" data-testid="link-order-shop">Keep looking <ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

export default function OrderDetailPage({ id }: { id: string }) {
  const order = ordersStore.use().find((entry) => entry.id === id);
  return order ? <OrderDetail order={order} /> : <NotFound />;
}

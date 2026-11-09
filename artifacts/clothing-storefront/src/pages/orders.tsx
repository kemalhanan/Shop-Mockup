import { Link } from 'wouter';
import { ArrowRight, Package } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/use-shop-navigation';
import { formatOrderDate, orderItemCount, ordersStore, orderStatus } from '@/lib/orders';
import { money } from '@/lib/pricing';
import { showToast } from '@/lib/shop-store';

function clearHistory() {
  const previous = ordersStore.get();
  ordersStore.set([]);
  showToast('Order history cleared from this browser.', { label: 'Undo', run: () => ordersStore.set(previous) });
}

export default function OrdersPage() {
  useDocumentTitle('Your orders');
  const orders = ordersStore.use();

  return (
    <div className="page" data-testid="page-orders">
      <header className="page-head">
        <span className="section-label">Saved in this browser only</span>
        <h1 className="section-title">Your orders.</h1>
      </header>
      {orders.length > 0 ? (
        <>
          <ul className="order-list">
            {orders.map((order) => {
              const count = orderItemCount(order);
              return (
                <li key={order.id}>
                  <Link className="order-row" href={`/orders/${order.id}`} data-testid={`link-order-${order.id}`}>
                    <span className="order-row-main"><strong>{order.id}</strong><span>{formatOrderDate(order)} · {count} {count === 1 ? 'item' : 'items'}</span></span>
                    <span className="order-row-status">{orderStatus(order)}</span>
                    <span className="order-row-total">{money(order.totals.total, true)}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <button type="button" className="text-button order-clear" onClick={clearHistory} data-testid="button-clear-orders">Clear order history</button>
        </>
      ) : (
        <div className="page-empty" data-testid="empty-orders">
          <Package size={27} strokeWidth={1.25} aria-hidden="true" />
          <h2>No orders yet.</h2>
          <p>When you place a preview order, you’ll find it here.</p>
          <Link className="text-link" href="/" data-testid="link-orders-shop">Have a look around <ArrowRight size={13} aria-hidden="true" /></Link>
        </div>
      )}
    </div>
  );
}

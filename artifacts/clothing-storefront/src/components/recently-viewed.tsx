import { getProduct } from '@/data/products';
import { ProductCard } from '@/components/product-card';
import { recentlyViewedStore } from '@/lib/shop-store';

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const items = recentlyViewedStore.use()
    .filter((id) => id !== excludeId)
    .flatMap((id) => getProduct(id) ?? [])
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="product-rail" aria-labelledby="recently-viewed-heading" data-testid="section-recently-viewed">
      <h2 className="rail-title" id="recently-viewed-heading">Back for another look</h2>
      <div className="product-grid">
        {items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

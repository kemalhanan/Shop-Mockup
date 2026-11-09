import { Link } from 'wouter';
import { ArrowRight, Heart } from 'lucide-react';
import { getProduct } from '@/data/products';
import { ProductCard } from '@/components/product-card';
import { useDocumentTitle } from '@/hooks/use-shop-navigation';
import { savedStore } from '@/lib/shop-store';

export default function SavedPage() {
  useDocumentTitle('Saved');
  const saved = savedStore.use().flatMap((id) => getProduct(id) ?? []);

  return (
    <div className="page" data-testid="page-saved">
      <header className="page-head">
        <span className="section-label">Worth another look</span>
        <h1 className="section-title">Saved for later.</h1>
      </header>
      {saved.length > 0 ? (
        <div className="product-grid">
          {saved.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="page-empty" data-testid="empty-saved">
          <Heart size={27} strokeWidth={1.25} aria-hidden="true" />
          <h2>Nothing saved yet.</h2>
          <p>Tap the heart on anything you’d like to come back to.</p>
          <Link className="text-link" href="/" data-testid="link-saved-shop">Have a look around <ArrowRight size={13} aria-hidden="true" /></Link>
        </div>
      )}
    </div>
  );
}

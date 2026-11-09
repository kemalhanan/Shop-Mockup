import { type FormEvent, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Search, X } from 'lucide-react';
import { matchesQuery, products } from '@/data/products';
import { Modal } from '@/components/modal';
import { ProductImage, productPath } from '@/components/product-card';
import { useGoToSection } from '@/hooks/use-shop-navigation';
import { money } from '@/lib/pricing';
import { searchOpenStore } from '@/lib/shop-store';

const closeSearch = () => searchOpenStore.set(false);

function SearchPanel() {
  const [query, setQuery] = useState('');
  const goToSection = useGoToSection();
  const trimmed = query.trim();
  const results = useMemo(() => products.filter((product) => (trimmed ? matchesQuery(product, trimmed) : Boolean(product.tag))), [trimmed]);

  const seeAll = (event: FormEvent) => {
    event.preventDefault();
    closeSearch();
    goToSection('shop', trimmed ? { q: trimmed } : {});
  };

  return (
    <Modal className="modal search-panel" labelledBy="search-heading" onClose={closeSearch} testId="panel-search">
      <div className="search-inner">
        <h2 id="search-heading" className="sr-only">Search the shop</h2>
        <form className="search-field" role="search" onSubmit={seeAll}>
          <Search size={19} strokeWidth={1.6} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search products"
            placeholder="Find your thing"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            data-autofocus
            data-testid="input-search-dialog"
          />
          <button type="button" className="close-button" aria-label="Close search" onClick={closeSearch} data-testid="button-close-search"><X size={21} /></button>
        </form>
        <p className="section-label search-label" role="status" data-testid="text-search-status">
          {trimmed ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}` : 'Worth a look'}
        </p>
        {results.length > 0 ? (
          <ul className="search-results">
            {results.map((product) => (
              <li key={product.id}>
                <Link className="search-result" href={productPath(product)} onClick={closeSearch} data-testid={`link-search-${product.id}`}>
                  <span className="thumb"><ProductImage product={product} /></span>
                  <span className="search-result-text"><strong>{product.name}</strong><span>{product.detail}</span></span>
                  <span className="product-price">{money(product.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="search-empty" data-testid="empty-search">Nothing by that name yet. Try a fabric, a color or a category.</p>
        )}
        {trimmed && results.length > 0 && (
          <button type="button" className="text-link search-all" onClick={seeAll} data-testid="button-search-all">See these in the shop <ArrowRight size={13} /></button>
        )}
      </div>
    </Modal>
  );
}

export function SearchDialog() {
  return searchOpenStore.use() ? <SearchPanel /> : null;
}

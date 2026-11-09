import { type FormEvent, useMemo, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { ArrowDownRight, ArrowRight, Check, Search } from 'lucide-react';
import { categories, filterableSizes, isOneSize, isSoldOut, matchesQuery, products, type Product } from '@/data/products';
import { ProductCard } from '@/components/product-card';
import { RecentlyViewed } from '@/components/recently-viewed';
import { useDocumentTitle } from '@/hooks/use-shop-navigation';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

type ShopFilters = { category: string; q: string; size: string; sort: string };

const noFilters: ShopFilters = { category: 'Everything', q: '', size: '', sort: 'featured' };

/** Filters live in the URL, so a filtered view can be shared and is still there after Back. */
function useShopFilters() {
  const search = useSearch();
  const [, navigate] = useLocation();

  const filters = useMemo<ShopFilters>(() => {
    const params = new URLSearchParams(search);
    const pick = (key: keyof ShopFilters, allowed: string[]) => {
      const value = params.get(key);
      return value && allowed.includes(value) ? value : noFilters[key];
    };
    return {
      category: pick('category', categories),
      q: params.get('q') ?? '',
      size: pick('size', filterableSizes),
      sort: pick('sort', sortOptions.map((option) => option.value)),
    };
  }, [search]);

  const setFilters = (changes: Partial<ShopFilters>) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams();
    (Object.keys(next) as (keyof ShopFilters)[]).forEach((key) => {
      if (next[key] !== noFilters[key]) params.set(key, next[key]);
    });
    const query = params.toString();
    navigate(query ? `/?${query}` : '/', { replace: true });
  };

  return { filters, setFilters };
}

function selectProducts({ category, q, size, sort }: ShopFilters) {
  const matching = products.filter((product) => {
    const fitsSize = !size || isOneSize(product) || (product.sizes.includes(size) && !isSoldOut(product, size));
    return (category === 'Everything' || product.category === category) && matchesQuery(product, q) && fitsSize;
  });
  const orderings: Record<string, (a: Product, b: Product) => number> = {
    newest: (a, b) => a.recency - b.recency,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
  };
  return orderings[sort] ? matching.toSorted(orderings[sort]) : matching;
}

export default function HomePage() {
  useDocumentTitle();
  const { filters, setFilters } = useShopFilters();
  const visibleProducts = useMemo(() => selectProducts(filters), [filters]);
  const [email, setEmail] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSignedUp(true);
  };

  return (
    <>
      <section className="hero" aria-label="Good Form spring collection">
        <img className="hero-img" src="/atelier-hero.webp" alt="Relaxed spring layers in a sunlit courtyard" fetchPriority="high" data-testid="img-hero" />
        <div className="hero-copy">
          <span className="eyebrow">The everyday, considered / 01—26</span>
          <h1>Wear it<br /><em>your way.</em></h1>
          <p>Good clothes, no grand occasion required. Meet the pieces that make getting dressed feel like you.</p>
          <a className="primary-link" href="#shop" data-testid="link-shop-collection">Shop the collection <ArrowDownRight size={15} /></a>
        </div>
        <span className="hero-index">A SMALL WARDROBE FOR REAL LIFE&nbsp;&nbsp; / &nbsp;&nbsp;GF—01</span>
      </section>

      <div className="ticker" aria-label="Our values">
        <span>Good things, worn often</span><span>·</span><span>Thoughtful by nature</span><span>·</span><span>Made to live in</span>
      </div>

      <section className="shop-section" id="shop">
        <div className="section-head">
          <div><span className="section-label">The current collection&nbsp; / &nbsp;01—26</span><h2 className="section-title">A few very good things.</h2></div>
          <p className="section-note">Easy pieces, considered down to the last button. Made to move through your actual life.</p>
        </div>
        <div className="shop-controls">
          <div className="category-list" role="group" aria-label="Filter products by category">
            {categories.map((item) => (
              <button key={item} className={`category-btn${filters.category === item ? ' active' : ''}`} aria-pressed={filters.category === item} data-testid={`filter-${item.toLowerCase()}`} onClick={() => setFilters({ category: item })}>{item}</button>
            ))}
          </div>
          <label className="search-box">
            <Search size={15} aria-hidden="true" />
            <input id="product-search" type="search" aria-label="Search products" placeholder="Find your thing" value={filters.q} onChange={(event) => setFilters({ q: event.target.value })} data-testid="input-product-search" />
          </label>
        </div>
        <div className="shop-refine">
          <p className="result-count" role="status" data-testid="text-result-count">{visibleProducts.length} {visibleProducts.length === 1 ? 'piece' : 'pieces'}</p>
          <div className="refine-controls">
            <label>
              <span>Size</span>
              <select value={filters.size} onChange={(event) => setFilters({ size: event.target.value })} data-testid="select-filter-size">
                <option value="">Any</option>
                {filterableSizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={filters.sort} onChange={(event) => setFilters({ sort: event.target.value })} data-testid="select-sort">
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="product-grid">
          {visibleProducts.length ? visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} preferredSize={filters.size || undefined} />
          )) : (
            <div className="empty-results" data-testid="empty-products">
              <h3>No matches just yet.</h3>
              <p>Try another word or take a look at everything.</p>
              <button className="text-link" onClick={() => setFilters(noFilters)} data-testid="button-reset-filters">Clear filters <ArrowRight size={13} /></button>
            </div>
          )}
        </div>
        <RecentlyViewed />
      </section>

      <section className="story" id="our-way">
        <div className="story-image"><img src="/atelier-hero.webp" alt="A thoughtfully made jacket, worn in the afternoon sun" loading="lazy" data-testid="img-story" /></div>
        <div className="story-copy">
          <span className="section-label">A little less, a little better</span>
          <h2>Clothes should feel like <em>coming home.</em></h2>
          <p>We make small runs of pieces worth reaching for. Natural fabrics, good proportions, and just enough character to make them yours.</p>
          <a className="text-link" href="#shop" data-testid="link-read-our-way">Find your everyday <ArrowRight size={14} /></a>
        </div>
      </section>

      <section className="promise-row" aria-label="The Good Form promise">
        <div className="promise"><span className="promise-number">01</span><div><strong>Thoughtful materials</strong><span>Better fibers, chosen for how they feel and how they last.</span></div></div>
        <div className="promise"><span className="promise-number">02</span><div><strong>Small, considered runs</strong><span>Made in smaller quantities, with fewer things to waste.</span></div></div>
        <div className="promise"><span className="promise-number">03</span><div><strong>Room to be yourself</strong><span>Comfortable shapes with a little point of view.</span></div></div>
      </section>

      <section className="newsletter" aria-labelledby="newsletter-heading">
        <span className="section-label">A note from the studio</span>
        <h2 id="newsletter-heading">A good thing, now and then.</h2>
        <p>New pieces, good reads, and the occasional note on getting dressed. Never the noisy stuff.</p>
        {signedUp ? <div className="signup-success" role="status" data-testid="status-newsletter"><Check size={15} /> You're on the list. Talk soon.</div> : (
          <form className="newsletter-form" onSubmit={submitNewsletter}>
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" required placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} data-testid="input-newsletter-email" />
            <button type="submit" data-testid="button-newsletter-submit">Count me in <ArrowRight size={14} /></button>
          </form>
        )}
      </section>
    </>
  );
}

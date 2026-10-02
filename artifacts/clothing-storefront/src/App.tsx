import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  category: string;
  detail: string;
  price: number;
  image: string;
  tag?: string;
  sizes: string[];
};

type CartLine = { productId: string; size: string; quantity: number };

const products: Product[] = [
  { id: 'sunday-knit', name: 'Sunday Knit Polo', category: 'Tops', detail: 'Organic cotton · Butter', price: 98, image: '/product-knit.png', tag: 'Bestseller', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'everyday-shirt', name: 'Everyday Poplin', category: 'Tops', detail: 'Washed cotton · Sky', price: 112, image: '/product-shirt.png', tag: 'Just in', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'easy-trouser', name: 'Easy Trouser', category: 'Bottoms', detail: 'Recycled twill · Fig', price: 138, image: '/product-trouser.png', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'field-jacket', name: 'Field Jacket', category: 'Layers', detail: 'Cotton canvas · Moss', price: 218, image: '/atelier-hero.png', tag: 'Small batch', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'soft-tee', name: 'The Soft Tee', category: 'Tops', detail: 'Linen jersey · Chalk', price: 64, image: '/product-shirt.png', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'studio-pant', name: 'Studio Pant', category: 'Bottoms', detail: 'Linen blend · Ink', price: 146, image: '/product-trouser.png', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: 'market-tote', name: 'Market Tote', category: 'Accessories', detail: 'Heavy cotton canvas · Poppy', price: 38, image: '/product-tote.png', tag: 'Made to carry', sizes: ['One size'] },
];

const categories = ['Everything', 'Tops', 'Bottoms', 'Layers', 'Accessories'];
const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

function App() {
  const [category, setCategory] = useState('Everything');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const categoryMatch = category === 'Everything' || product.category === category;
    const query = search.trim().toLowerCase();
    const searchMatch = !query || `${product.name} ${product.category} ${product.detail}`.toLowerCase().includes(query);
    return categoryMatch && searchMatch;
  }), [category, search]);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!cartOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCartOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cartOpen]);

  const chooseCategory = (value: string) => {
    setCategory(value);
    setMobileMenuOpen(false);
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  const addToCart = (product: Product) => {
    const size = sizes[product.id] ?? 'M';
    setCart((items) => {
      const existing = items.find((item) => item.productId === product.id && item.size === size);
      return existing
        ? items.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { productId: product.id, size, quantity: 1 }];
    });
    setCheckoutMessage(false);
    setToast(`${product.name} · ${size} added to your bag`);
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart((items) => items.flatMap((item) => {
      if (item.productId !== productId || item.size !== size) return [item];
      const quantity = item.quantity + delta;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
    setCheckoutMessage(false);
  };

  const removeItem = (productId: string, size: string) => {
    setCart((items) => items.filter((item) => item.productId !== productId || item.size !== size));
    setCheckoutMessage(false);
  };

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSignedUp(true);
  };

  return (
    <div className="site-shell">
      <div className="announcement" data-testid="text-announcement">Complimentary shipping on orders over $150&nbsp; · &nbsp;Made for the in-between</div>
      <header className="masthead">
        <button className="close-button mobile-menu" aria-label={mobileMenuOpen ? 'Close category menu' : 'Open category menu'} aria-expanded={mobileMenuOpen} data-testid="button-mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <a className="wordmark" href="#top" aria-label="Good Form home" data-testid="link-home">good form<span>.</span></a>
        <nav className={`main-nav${mobileMenuOpen ? ' mobile-open' : ''}`} aria-label="Product categories">
          {categories.slice(1, 4).map((item) => <button key={item} data-testid={`nav-category-${item.toLowerCase()}`} onClick={() => chooseCategory(item)}>{item}</button>)}
          <button data-testid="nav-about" onClick={() => document.getElementById('our-way')?.scrollIntoView({ behavior: 'smooth' })}>Our way</button>
        </nav>
        <div className="utilities">
          <button className="utility-btn" aria-label="Scroll to product search" data-testid="button-search-focus" onClick={() => { document.getElementById('product-search')?.focus(); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <Search size={17} strokeWidth={1.6} /><span>Search</span>
          </button>
          <button className="utility-btn" aria-label={`Open bag with ${cartCount} items`} data-testid="button-open-cart" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={17} strokeWidth={1.6} /><span>Bag</span><span className="bag-count" data-testid="text-cart-count">{cartCount}</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-label="Good Form spring collection">
          <img className="hero-img" src="/atelier-hero.png" alt="Relaxed spring layers in a sunlit courtyard" data-testid="img-hero" />
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
              {categories.map((item) => <button key={item} className={`category-btn${category === item ? ' active' : ''}`} aria-pressed={category === item} data-testid={`filter-${item.toLowerCase()}`} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <label className="search-box">
              <Search size={15} aria-hidden="true" />
              <input id="product-search" type="search" aria-label="Search products" placeholder="Find your thing" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-product-search" />
            </label>
          </div>
          <div className="product-grid" aria-live="polite">
            {visibleProducts.length ? visibleProducts.map((product) => (
              <article className="product-card" key={product.id} data-testid={`card-product-${product.id}`}>
                <div className="product-visual">
                  <img src={product.image} alt={`${product.name}, ${product.detail}`} loading="lazy" data-testid={`img-product-${product.id}`} />
                  {product.tag && <span className="product-tag">{product.tag}</span>}
                </div>
                <div className="product-details">
                  <div className="product-line"><span className="product-name" data-testid={`text-product-name-${product.id}`}>{product.name}</span><span className="product-price" data-testid={`text-product-price-${product.id}`}>{money(product.price)}</span></div>
                  <p className="product-desc">{product.detail}</p>
                  <div className="product-actions">
                    <label className="sr-only" htmlFor={`size-${product.id}`}>Choose a size for {product.name}</label>
                    <select className="size-select" id={`size-${product.id}`} value={sizes[product.id] ?? 'M'} onChange={(event) => setSizes((current) => ({ ...current, [product.id]: event.target.value }))} data-testid={`select-size-${product.id}`}>
                      {product.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                    <button className="add-btn" data-testid={`button-add-${product.id}`} onClick={() => addToCart(product)}>Add to bag <Plus size={12} /></button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="empty-results" data-testid="empty-products"><h3>No matches just yet.</h3><p>Try another word or take a look at everything.</p><button className="text-link" onClick={() => { setSearch(''); setCategory('Everything'); }} data-testid="button-reset-filters">Clear filters <ArrowRight size={13} /></button></div>
            )}
          </div>
        </section>

        <section className="story" id="our-way">
          <div className="story-image"><img src="/atelier-hero.png" alt="A thoughtfully made jacket, worn in the afternoon sun" loading="lazy" data-testid="img-story" /></div>
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
      </main>

      <footer className="footer">
        <a className="footer-brand" href="#top" data-testid="link-footer-home">good form.</a>
        <span>Made for the in-between.</span>
        <span>© Good Form Studio 2026&nbsp; · &nbsp;A little goes a long way</span>
      </footer>

      {cartOpen && (
        <>
          <button className="overlay" aria-label="Close shopping bag" onClick={() => setCartOpen(false)} data-testid="button-cart-overlay" />
          <aside className="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-heading" data-testid="panel-cart">
            <div className="cart-header"><h2 id="cart-heading">Your bag <span className="section-label">({cartCount})</span></h2><button className="close-button" aria-label="Close bag" onClick={() => setCartOpen(false)} data-testid="button-close-cart"><X size={21} /></button></div>
            <div className="cart-content">
              {cart.length === 0 ? <div className="cart-empty" data-testid="empty-cart"><ShoppingBag size={27} strokeWidth={1.25} /><p>Your bag has room.</p><span>Find something you’ll reach for often.</span><button className="text-link" onClick={() => setCartOpen(false)} data-testid="button-continue-shopping">Keep looking <ArrowRight size={13} /></button></div> : (
                <div className="cart-items">
                  {cart.map((item) => {
                    const product = products.find((entry) => entry.id === item.productId);
                    if (!product) return null;
                    return <div className="cart-item" key={`${item.productId}-${item.size}`} data-testid={`row-cart-${item.productId}-${item.size}`}>
                      <img src={product.image} alt="" />
                      <div className="cart-item-info"><strong>{product.name}</strong><span>Size {item.size} · {product.detail}</span><div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
                        <button aria-label={`Decrease ${product.name} quantity`} data-testid={`button-quantity-minus-${product.id}-${item.size}`} onClick={() => updateQuantity(product.id, item.size, -1)}><Minus size={12} /></button>
                        <output data-testid={`text-quantity-${product.id}-${item.size}`}>{item.quantity}</output>
                        <button aria-label={`Increase ${product.name} quantity`} data-testid={`button-quantity-plus-${product.id}-${item.size}`} onClick={() => updateQuantity(product.id, item.size, 1)}><Plus size={12} /></button>
                      </div></div>
                      <div><span className="item-price">{money(product.price * item.quantity)}</span><br /><button className="remove-button" data-testid={`button-remove-${product.id}-${item.size}`} onClick={() => removeItem(product.id, item.size)}>Remove</button></div>
                    </div>;
                  })}
                </div>
              )}
            </div>
            <div className="cart-footer">
              <div className="subtotal"><span>Subtotal</span><span data-testid="text-cart-subtotal">{money(subtotal)}</span></div>
              <p className="cart-disclaimer">Shipping and any applicable taxes are calculated at checkout. Complimentary shipping over $150.</p>
              <button className="primary-button checkout-button" data-testid="button-checkout" onClick={() => setCheckoutMessage(true)}>Continue to checkout <ArrowRight size={15} /></button>
              {checkoutMessage && <p className="checkout-note" role="status" data-testid="status-checkout">This is a storefront preview. Payments and checkout aren’t enabled, so your bag is just for browsing.</p>}
            </div>
          </aside>
        </>
      )}
      {toast && <div className="toast" role="status" data-testid="status-added-to-bag">{toast}</div>}
    </div>
  );
}

export default App;
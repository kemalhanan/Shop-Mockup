import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useGoToSection } from '@/hooks/use-shop-navigation';
import { openBag, savedStore, searchOpenStore, useBagCount } from '@/lib/shop-store';

const navCategories = ['Tops', 'Bottoms', 'Layers'];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const goToSection = useGoToSection();
  const bagCount = useBagCount();
  const savedCount = savedStore.use().length;
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="masthead">
      <button className="close-button mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} data-testid="button-mobile-menu" onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      <Link
        className="wordmark"
        href="/"
        aria-label="Good Form home"
        data-testid="link-home"
        onClick={() => {
          closeMenu();
          if (location === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        good form<span>.</span>
      </Link>
      <nav className={`main-nav${menuOpen ? ' mobile-open' : ''}`} aria-label="Main">
        {navCategories.map((category) => (
          <button
            key={category}
            data-testid={`nav-category-${category.toLowerCase()}`}
            onClick={() => {
              closeMenu();
              goToSection('shop', { category });
            }}
          >
            {category}
          </button>
        ))}
        <button
          data-testid="nav-about"
          onClick={() => {
            closeMenu();
            goToSection('our-way');
          }}
        >
          Our way
        </button>
        <Link className="mobile-only" href="/orders" onClick={closeMenu} data-testid="nav-orders">Your orders</Link>
      </nav>
      <div className="utilities">
        <button className="utility-btn" aria-label="Search products" data-testid="button-search-focus" onClick={() => searchOpenStore.set(true)}>
          <Search size={17} strokeWidth={1.6} aria-hidden="true" /><span>Search</span>
        </button>
        <Link className="utility-btn" href="/saved" aria-label={`Saved items, ${savedCount} saved`} onClick={closeMenu} data-testid="link-saved">
          <Heart size={17} strokeWidth={1.6} aria-hidden="true" /><span>Saved</span>{savedCount > 0 && <span className="bag-count saved-count" data-testid="text-saved-count">{savedCount}</span>}
        </Link>
        <button className="utility-btn" aria-label={`Open bag with ${bagCount} items`} data-testid="button-open-cart" onClick={openBag}>
          <ShoppingBag size={17} strokeWidth={1.6} aria-hidden="true" /><span>Bag</span><span className="bag-count" data-testid="text-cart-count">{bagCount}</span>
        </button>
      </div>
    </header>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Plus } from 'lucide-react';
import { getProduct, isLowStock, isOneSize, isSoldOut, type Product } from '@/data/products';
import { ProductCard, ProductImage, SaveButton } from '@/components/product-card';
import { RecentlyViewed } from '@/components/recently-viewed';
import { SizeGuideDialog } from '@/components/size-guide-dialog';
import { useDocumentTitle } from '@/hooks/use-shop-navigation';
import { FREE_SHIPPING_THRESHOLD, money } from '@/lib/pricing';
import { addToBagWithToast, recordView } from '@/lib/shop-store';
import NotFound from '@/pages/not-found';

function ProductDetail({ product }: { product: Product }) {
  useDocumentTitle(product.name);
  const [view, setView] = useState(product.views[0]);
  const [size, setSize] = useState<string | null>(isOneSize(product) ? product.sizes[0] : null);
  const [sizeMissing, setSizeMissing] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const sizePicker = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    recordView(product.id);
  }, [product.id]);

  const add = () => {
    if (!size) {
      setSizeMissing(true);
      sizePicker.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
      return;
    }
    addToBagWithToast(product, size);
  };

  const pairings = product.pairsWith.flatMap((id) => getProduct(id) ?? []);

  return (
    <div className="product-page" data-testid={`page-product-${product.id}`}>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/" data-testid="link-breadcrumb-shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/?category=${encodeURIComponent(product.category)}`} data-testid="link-breadcrumb-category">{product.category}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-layout">
        <div className="product-gallery">
          <div className="gallery-main">
            <ProductImage product={product} view={view} alt={`${product.name}, ${product.detail}: ${view.label.toLowerCase()} view`} eager testId="img-product-main" />
            {product.tag && <span className="product-tag">{product.tag}</span>}
          </div>
          <div className="gallery-thumbs" role="group" aria-label="Product views">
            {product.views.map((option) => (
              <button key={option.label} type="button" className="gallery-thumb" aria-pressed={view.label === option.label} aria-label={`Show ${option.label.toLowerCase()} view`} onClick={() => setView(option)} data-testid={`button-view-${option.label.toLowerCase()}`}>
                <ProductImage product={product} view={option} eager />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <span className="section-label">{product.detail}</span>
          <h1 data-testid="text-product-title">{product.name}</h1>
          <p className="product-info-price" data-testid="text-product-price">{money(product.price)}</p>
          <p className="product-info-description">{product.description}</p>

          <fieldset className="size-picker" ref={sizePicker}>
            <legend className="sr-only">Size</legend>
            <div className="size-picker-head">
              <span className="field-label" aria-hidden="true">Size</span>
              {product.sizeChart && <button type="button" className="text-button" onClick={() => setGuideOpen(true)} data-testid="button-size-guide">Size guide</button>}
            </div>
            <div className="size-options">
              {product.sizes.map((option) => {
                const soldOut = isSoldOut(product, option);
                return (
                  <label className="size-option" key={option}>
                    <input
                      type="radio"
                      name="size"
                      value={option}
                      checked={size === option}
                      disabled={soldOut}
                      aria-label={soldOut ? `${option}, sold out` : option}
                      onChange={() => {
                        setSize(option);
                        setSizeMissing(false);
                      }}
                      data-testid={`radio-size-${option}`}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {sizeMissing && <p className="field-error" role="alert" data-testid="error-size">Pick a size first, then it’s all yours.</p>}
            {size && isLowStock(product, size) && <p className="stock-note" data-testid="text-low-stock">Only a few left in {size}.</p>}
          </fieldset>

          <div className="product-info-actions">
            <button type="button" className="primary-button" onClick={add} data-testid="button-add-to-bag">Add to bag <Plus size={13} aria-hidden="true" /></button>
            <SaveButton product={product} showLabel />
          </div>
          <p className="product-info-note">Complimentary shipping on orders of {money(FREE_SHIPPING_THRESHOLD)} or more. Free returns within 30 days.</p>

          <div className="product-accordion">
            <details name="product-info" open>
              <summary>Fit</summary>
              <p>{product.fit}</p>
            </details>
            <details name="product-info">
              <summary>Fabric and care</summary>
              <p>{product.fabric}</p>
              <ul>{product.care.map((step) => <li key={step}>{step}</li>)}</ul>
            </details>
            <details name="product-info">
              <summary>Shipping and returns</summary>
              <p>Standard delivery takes 3–5 business days and Express takes 1–2. Send anything back within 30 days, unworn, and we’ll cover the return.</p>
            </details>
          </div>
        </div>
      </div>

      <section className="product-rail" aria-labelledby="pairings-heading">
        <h2 className="rail-title" id="pairings-heading">Goes well with</h2>
        <div className="product-grid">
          {pairings.map((pairing) => <ProductCard key={pairing.id} product={pairing} />)}
        </div>
      </section>

      <RecentlyViewed excludeId={product.id} />

      <Link className="text-link back-link" href="/" data-testid="link-back-to-shop">Back to the shop <ArrowRight size={13} aria-hidden="true" /></Link>

      {guideOpen && product.sizeChart && <SizeGuideDialog chart={product.sizeChart} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

export default function ProductPage({ id }: { id: string }) {
  const product = getProduct(id);
  return product ? <ProductDetail product={product} /> : <NotFound />;
}

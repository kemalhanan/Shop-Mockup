import { type CSSProperties, useState } from 'react';
import { Link } from 'wouter';
import { Heart, Plus } from 'lucide-react';
import { defaultSize, isLowStock, isSoldOut, type Product, type ProductView } from '@/data/products';
import { money } from '@/lib/pricing';
import { addToBagWithToast, savedStore, toggleSaved } from '@/lib/shop-store';

export const productPath = (product: Product) => `/products/${product.id}`;

type ProductImageProps = { product: Product; view?: ProductView; alt?: string; eager?: boolean; testId?: string };

/** The product's photo, framed on one of its views. The parent decides the size and clips the zoom. */
export function ProductImage({ product, view = product.views[0], alt = '', eager = false, testId }: ProductImageProps) {
  const framing = { '--x': `${view.x}%`, '--y': `${view.y}%`, '--zoom': view.zoom } as CSSProperties;
  return <img className="framed-image" src={product.image} alt={alt} loading={eager ? 'eager' : 'lazy'} style={framing} data-testid={testId} />;
}

export function SaveButton({ product, showLabel = false }: { product: Product; showLabel?: boolean }) {
  const saved = savedStore.use().includes(product.id);
  return (
    <button
      type="button"
      className={showLabel ? 'save-button-labelled' : 'save-button'}
      aria-pressed={saved}
      aria-label={showLabel ? undefined : `Save ${product.name}`}
      onClick={() => toggleSaved(product.id)}
      data-testid={`button-save-${product.id}`}
    >
      <Heart size={showLabel ? 14 : 15} strokeWidth={1.6} aria-hidden="true" />
      {showLabel && (saved ? 'Saved' : 'Save for later')}
    </button>
  );
}

function sizeOptionLabel(product: Product, size: string) {
  if (isSoldOut(product, size)) return `${size} · sold out`;
  if (isLowStock(product, size)) return `${size} · last few`;
  return size;
}

export function ProductCard({ product, preferredSize }: { product: Product; preferredSize?: string }) {
  const [chosenSize, setChosenSize] = useState<string | null>(null);
  const size = chosenSize ?? defaultSize(product, preferredSize);

  return (
    <article className="product-card" data-testid={`card-product-${product.id}`}>
      <div className="product-visual">
        {/* The name below is the link for keyboard and screen reader users. This one is a bigger mouse target. */}
        <Link href={productPath(product)} tabIndex={-1} aria-hidden="true" data-testid={`link-image-${product.id}`}>
          <ProductImage product={product} testId={`img-product-${product.id}`} />
        </Link>
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <SaveButton product={product} />
      </div>
      <div className="product-details">
        <div className="product-line">
          <Link className="product-name" href={productPath(product)} data-testid={`text-product-name-${product.id}`}>{product.name}</Link>
          <span className="product-price" data-testid={`text-product-price-${product.id}`}>{money(product.price)}</span>
        </div>
        <p className="product-desc">{product.detail}</p>
        <div className="product-actions">
          <label className="sr-only" htmlFor={`size-${product.id}`}>Choose a size for {product.name}</label>
          <select className="size-select" id={`size-${product.id}`} value={size} onChange={(event) => setChosenSize(event.target.value)} data-testid={`select-size-${product.id}`}>
            {product.sizes.map((option) => <option key={option} value={option} disabled={isSoldOut(product, option)}>{sizeOptionLabel(product, option)}</option>)}
          </select>
          <button type="button" className="add-btn" data-testid={`button-add-${product.id}`} onClick={() => addToBagWithToast(product, size)}>Add to bag <Plus size={12} aria-hidden="true" /></button>
        </div>
      </div>
    </article>
  );
}

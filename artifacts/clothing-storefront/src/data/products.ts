/** A framing of a product photo. x/y are the focal point in percent, zoom is a scale factor. */
export type ProductView = { label: string; x: number; y: number; zoom: number };

export type SizeChartId = 'tops' | 'bottoms';

export type Product = {
  id: string;
  name: string;
  category: string;
  detail: string;
  price: number;
  image: string;
  tag?: string;
  sizes: string[];
  soldOut?: string[];
  lowStock?: string[];
  /** Position in the "newest" sort, where 1 is the most recent arrival. */
  recency: number;
  description: string;
  fit: string;
  fabric: string;
  care: string[];
  sizeChart?: SizeChartId;
  pairsWith: string[];
  /** The first view is the framing used wherever the product appears in a list. */
  views: ProductView[];
};

const clothingSizes = ['XS', 'S', 'M', 'L', 'XL'];

export const products: Product[] = [
  {
    id: 'sunday-knit',
    name: 'Sunday Knit Polo',
    category: 'Tops',
    detail: 'Organic cotton · Butter',
    price: 98,
    image: '/product-knit.webp',
    tag: 'Bestseller',
    sizes: clothingSizes,
    lowStock: ['XS'],
    recency: 3,
    description: 'A polo with the ease of a favorite sweater. An open rib knit in soft organic cotton that drapes rather than clings, finished with a two-button placket and a collar that keeps its shape.',
    fit: 'Relaxed through the body. Take your usual size, or size down for a neater line.',
    fabric: '100% organic cotton in an open rib knit.',
    care: ['Hand wash cold or use a wool cycle', 'Dry flat', 'Cool iron if needed'],
    sizeChart: 'tops',
    pairsWith: ['easy-trouser', 'market-tote', 'studio-pant'],
    views: [
      { label: 'Full', x: 50, y: 50, zoom: 1 },
      { label: 'Collar', x: 52, y: 48, zoom: 2 },
      { label: 'Knit', x: 62, y: 85, zoom: 2.6 },
    ],
  },
  {
    id: 'everyday-shirt',
    name: 'Everyday Poplin',
    category: 'Tops',
    detail: 'Washed cotton · Sky',
    price: 112,
    image: '/product-shirt.webp',
    tag: 'Just in',
    sizes: clothingSizes,
    soldOut: ['S'],
    recency: 1,
    description: 'The shirt you reach for without thinking. Washed cotton poplin, cut oversized with a soft collar and a single chest pocket. It looks better the more you wear it.',
    fit: 'Oversized with a dropped shoulder. Size down for a closer fit.',
    fabric: '100% cotton poplin, garment washed so it feels broken in from day one.',
    care: ['Machine wash cold', 'Hang dry', 'Warm iron while damp'],
    sizeChart: 'tops',
    pairsWith: ['easy-trouser', 'field-jacket', 'market-tote'],
    views: [
      { label: 'Full', x: 50, y: 40, zoom: 1 },
      { label: 'Collar', x: 55, y: 60, zoom: 1.9 },
      { label: 'Pocket', x: 62, y: 92, zoom: 2.2 },
    ],
  },
  {
    id: 'easy-trouser',
    name: 'Easy Trouser',
    category: 'Bottoms',
    detail: 'Recycled twill · Fig',
    price: 138,
    image: '/product-trouser.webp',
    sizes: clothingSizes,
    soldOut: ['XL'],
    lowStock: ['L'],
    recency: 4,
    description: 'A high rise and a wide, pleated leg, in a recycled twill with enough weight to hold its line. Dresses up without much effort and dresses down without any.',
    fit: 'High rise with a wide leg. True to size, with a 31-inch inseam that sits just above the floor.',
    fabric: '68% recycled polyester, 30% viscose, 2% elastane twill.',
    care: ['Machine wash cold', 'Hang dry', 'Steam or cool iron'],
    sizeChart: 'bottoms',
    pairsWith: ['soft-tee', 'everyday-shirt', 'field-jacket'],
    views: [
      { label: 'Full', x: 50, y: 50, zoom: 1 },
      { label: 'Waist', x: 50, y: 33, zoom: 2.2 },
      { label: 'Hem', x: 55, y: 90, zoom: 2.2 },
    ],
  },
  {
    id: 'field-jacket',
    name: 'Field Jacket',
    category: 'Layers',
    detail: 'Cotton canvas · Moss',
    price: 218,
    image: '/atelier-hero.webp',
    tag: 'Small batch',
    sizes: clothingSizes,
    soldOut: ['XS'],
    lowStock: ['S', 'M'],
    recency: 2,
    description: 'The layer that goes over everything. A soft, button-through jacket with a stand collar and deep side pockets, made in small runs and only in the one shade of moss.',
    fit: 'Boxy with room for a sweater underneath. Take your usual size.',
    fabric: '100% brushed cotton canvas with a cotton lining.',
    care: ['Spot clean where you can', 'Dry clean when you must', 'Store on a wide hanger'],
    sizeChart: 'tops',
    pairsWith: ['soft-tee', 'easy-trouser', 'everyday-shirt'],
    views: [
      { label: 'Full', x: 72, y: 50, zoom: 1 },
      { label: 'Collar', x: 66, y: 30, zoom: 2 },
      { label: 'Pocket', x: 75, y: 75, zoom: 2 },
    ],
  },
  {
    id: 'soft-tee',
    name: 'The Soft Tee',
    category: 'Tops',
    detail: 'Linen jersey · Chalk',
    price: 64,
    image: '/product-trouser.webp',
    sizes: clothingSizes,
    recency: 5,
    description: 'A plain tee, done properly. Linen jersey with a little weight to it, a neckline that stays put, and sleeves that hit where they should.',
    fit: 'Straight through the body with a slightly cropped length. True to size.',
    fabric: '100% linen jersey.',
    care: ['Machine wash cold', 'Dry flat', 'Cool iron if needed'],
    sizeChart: 'tops',
    pairsWith: ['easy-trouser', 'studio-pant', 'field-jacket'],
    views: [
      { label: 'Full', x: 50, y: 5, zoom: 2.6 },
      { label: 'Neckline', x: 50, y: 3, zoom: 4 },
      { label: 'Sleeve', x: 63, y: 12, zoom: 4 },
    ],
  },
  {
    id: 'studio-pant',
    name: 'Studio Pant',
    category: 'Bottoms',
    detail: 'Linen blend · Ink',
    price: 146,
    image: '/product-trouser.webp',
    sizes: clothingSizes,
    soldOut: ['XS', 'S'],
    recency: 6,
    description: 'Our studio uniform. A linen blend that breathes in the summer and layers in the winter, with a wide leg, a flat front and pockets that will hold what you need them to.',
    fit: 'Mid rise with a relaxed, wide leg. Size up for a looser line.',
    fabric: '55% linen, 45% cotton.',
    care: ['Machine wash cold', 'Hang dry', 'Warm iron while damp'],
    sizeChart: 'bottoms',
    pairsWith: ['soft-tee', 'sunday-knit', 'market-tote'],
    views: [
      { label: 'Full', x: 50, y: 50, zoom: 1 },
      { label: 'Waist', x: 50, y: 33, zoom: 2.2 },
      { label: 'Hem', x: 55, y: 90, zoom: 2.2 },
    ],
  },
  {
    id: 'market-tote',
    name: 'Market Tote',
    category: 'Accessories',
    detail: 'Heavy cotton canvas · Poppy',
    price: 38,
    image: '/product-tote.webp',
    tag: 'Made to carry',
    sizes: ['One size'],
    recency: 7,
    description: 'Big enough for the market, the library, or a day that wandered off plan. Heavy cotton canvas with long handles that sit comfortably on the shoulder.',
    fit: '15 inches wide, 16 inches tall, with a 5-inch base and 11-inch handle drop.',
    fabric: '100% heavy cotton canvas.',
    care: ['Spot clean', 'Air dry', 'Softens with use'],
    pairsWith: ['sunday-knit', 'everyday-shirt', 'soft-tee'],
    views: [
      { label: 'Full', x: 50, y: 50, zoom: 1 },
      { label: 'Handles', x: 45, y: 35, zoom: 1.9 },
      { label: 'Weave', x: 40, y: 65, zoom: 3 },
    ],
  },
];

export const categories = ['Everything', 'Tops', 'Bottoms', 'Layers', 'Accessories'];

/** Sizes offered by the clothing, used by the shop's size filter. */
export const filterableSizes = clothingSizes;

const productsById = new Map(products.map((product) => [product.id, product]));

export const getProduct = (id: string) => productsById.get(id);

export const isSoldOut = (product: Product, size: string) => product.soldOut?.includes(size) ?? false;

export const isLowStock = (product: Product, size: string) => product.lowStock?.includes(size) ?? false;

export const isOneSize = (product: Product) => product.sizes.length === 1;

export const sizeLabel = (size: string) => (size === 'One size' ? size : `Size ${size}`);

/** The size to preselect: the shopper's preference, then M, then the first size in stock. */
export function defaultSize(product: Product, preferred?: string) {
  const inStock = product.sizes.filter((size) => !isSoldOut(product, size));
  if (preferred && inStock.includes(preferred)) return preferred;
  return inStock.includes('M') ? 'M' : inStock[0];
}

/** Every word in the query has to appear somewhere in the product's text. */
export function matchesQuery(product: Product, query: string) {
  const haystack = `${product.name} ${product.category} ${product.detail}`.toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((word) => haystack.includes(word));
}

type SizeRow = { size: string; measurements: Record<string, [number, number]> };

/** Body measurements in inches. */
export const sizeCharts: Record<SizeChartId, { columns: string[]; rows: SizeRow[] }> = {
  tops: {
    columns: ['Chest', 'Waist'],
    rows: [
      { size: 'XS', measurements: { Chest: [32, 34], Waist: [25, 27] } },
      { size: 'S', measurements: { Chest: [35, 37], Waist: [28, 30] } },
      { size: 'M', measurements: { Chest: [38, 40], Waist: [31, 33] } },
      { size: 'L', measurements: { Chest: [41, 43], Waist: [34, 36] } },
      { size: 'XL', measurements: { Chest: [44, 46], Waist: [37, 39] } },
    ],
  },
  bottoms: {
    columns: ['Waist', 'Hip'],
    rows: [
      { size: 'XS', measurements: { Waist: [25, 27], Hip: [34, 36] } },
      { size: 'S', measurements: { Waist: [28, 30], Hip: [37, 39] } },
      { size: 'M', measurements: { Waist: [31, 33], Hip: [40, 42] } },
      { size: 'L', measurements: { Waist: [34, 36], Hip: [43, 45] } },
      { size: 'XL', measurements: { Waist: [37, 39], Hip: [46, 48] } },
    ],
  },
};

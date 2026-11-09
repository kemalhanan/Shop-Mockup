# Good Form storefront mockup

A clickable mockup of a small clothing shop, from browsing through to a placed order. It runs entirely in the browser.

**This is a preview, not a working shop.** Checkout asks for no card details, nothing is charged, and nothing ships. Stock levels, the 8% tax, promo codes and delivery dates are placeholder data.

## Features

- Product pages with gallery views, a size picker, stock states and a size guide
- Sort and size filters kept in the URL, plus search from any page
- Saved items and recently viewed products
- A bag that survives reloads, with undo, promo codes (`WELCOME10`, `FREESHIP`) and a free-shipping meter
- A preview checkout, order confirmation and order history

Bag, saved items, promo and orders are kept in `localStorage`, and the checkout draft in `sessionStorage`. They exist only in that browser.

## Getting started

You need Node.js and pnpm. Corepack provides the pnpm version pinned in `package.json`; if `pnpm` isn't on your PATH, enable it with `corepack enable` so the workspace scripts can find it.

```bash
pnpm install
```

```bash
pnpm --filter @workspace/clothing-storefront run dev
```

The storefront runs at http://localhost:5173. Set `PORT` to use a different port.

## Project layout

| Path | What it is |
| --- | --- |
| `artifacts/clothing-storefront` | The storefront: Vite, React, wouter and hand-written CSS |
| `artifacts/api-server` | Express API, with only a health check so far (the storefront doesn't use it) |
| `artifacts/mockup-sandbox` | Vite sandbox for previewing UI components |
| `lib/api-spec` | OpenAPI spec and client code generation |
| `lib/api-client-react`, `lib/api-zod` | Generated API client and schemas |
| `lib/db` | Drizzle database package, with an empty schema so far |

Inside the storefront's `src` folder:

- `data/products.ts`: the catalog
- `lib/pricing.ts`: shipping, promo codes and totals
- `lib/shop-store.ts`, `lib/orders.ts`: bag, saved items and order state
- `pages/`, `components/`: routes and UI

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm run typecheck` | Typechecks the whole workspace |
| `pnpm run build` | Typechecks, then builds every package |
| `pnpm --filter @workspace/clothing-storefront run build` | Builds only the storefront, to `dist/public` |

The API server needs `PORT` set, and `lib/db` needs `DATABASE_URL`.

## Deployment

The project deploys to Vercel using the services defined in `vercel.json`. Requests to `/api/*` go to the API server and everything else goes to the storefront, which falls back to `index.html` so product links work on refresh.

# AGENTS.md

## Rules

- NOT test anything unless I say it explicitly.
- Use caveman always in ultra mode.
- Don't commit until I say it.

## Data layer

Layers, outside in:

1. **Components / pages** (`src/routes`, `src/lib/components`) — UI only.
   Never import mock data direct. Always go through the API layer.
2. **API layer** (`src/lib/api/*.ts`) — async functions. Promise in, Promise
   out. Today resolve mock. Tomorrow the real backend: swap the body only.
3. **Data / mocks** (`src/lib/data/*.ts`) — hardcoded fixtures + pure helpers.
   This is what disappears when the backend lands.
4. **Types** (`src/lib/data/types.ts`) — shared shapes. Price in **cents**,
   integer. Never float money.

Rule: component never knows if data is mock or HTTP. Pages get data through
SvelteKit `load()` (`+page.ts`) which calls the API layer.

### Why

Backend missing now. Components already behave like it exists. When API
arrives, change `src/lib/api/*.ts` only. Zero component edits.

### Conventions

- Prices: integer cents (`priceCents`). `formatCOP(cents)` for display.
- IDs/links: slugs, not numeric FKs.
- Async always, even for mock (`delay()`). Keeps `load()` + UI honest.
- One file per domain in `src/lib/api/` (`shop.ts`, `dogs.ts`, ...).
- Types live in `src/lib/data/types.ts` (or a sibling types file).

## How to add a new service

Example: news service.

1. **Types** — add shapes to `src/lib/data/types.ts` (or new `types.ts` in
   the domain). Keep API field names, not UI-only fields.

2. **Mock data** — `src/lib/data/news.ts`. Export arrays + pure helpers
   (lookup by slug, filters). No component imports it.

3. **API layer** — `src/lib/api/news.ts`:

   ```ts
   import { newsItems } from '#lib/data/news';

   function delay<T>(value: T): Promise<T> {
     return Promise.resolve(value);
   }

   export async function getNews() {
     return delay(newsItems);
   }

   export async function getNewsItem(slug: string) {
     return delay(newsItems.find((n) => n.slug === slug) ?? null);
   }
   ```

4. **Load** — `src/routes/noticias/+page.ts`:

   ```ts
   import { getNews } from '#lib/api/news';

   export async function load() {
     return { news: await getNews() };
   }
   ```

5. **Page/component** — read `data` prop. Import types, never mock.

When backend lands: replace step 3 bodies with `fetch()`. Steps 1, 2, 4, 5
stay, except 2 gets deleted.

### createOrder pattern (mutations)

Mutations also live in the API layer:

```ts
export async function createOrder(payload: OrderPayload): Promise<OrderResult> {
  // hoy: mock. mañana: POST /orders
}
```

Pages call it in an event handler, handle loading + error state, then
render the result. Cart/pay flow is the reference implementation.

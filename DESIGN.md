# Design Brief

## Direction

Kape Corner — a warm-analog coffee shop experience: cream paper surfaces, deep roasted-brown ink, and one caramel accent that carries every call to action.

## Tone

Warm analog editorial with modern restraint — cozy enough for a neighborhood café in the Philippines, disciplined enough to feel like a real ordering product, never cutesy or rustic-cliché.

## Differentiation

A single confident coffee-brown with one caramel accent, oversized Fraunces display type against small tracked uppercase labels, and a signature rising-steam motif on hero and product imagery.

## Color Palette

| Token      | OKLCH        | Role                                        |
| ---------- | ------------ | ------------------------------------------- |
| background | 0.965 0.014 78 | Warm cream page canvas                      |
| foreground | 0.26 0.032 48  | Dark-roast body ink                         |
| card       | 0.99 0.008 80  | Milk-white elevated surfaces                |
| primary    | 0.42 0.07 48   | Deep roasted coffee — brand, buttons, links |
| accent     | 0.72 0.135 62  | Caramel amber — CTAs, prices, active states |
| muted      | 0.925 0.022 78 | Beige section backgrounds, quiet surfaces   |

## Typography

- Display: Fraunces — hero headlines, section titles, brand wordmark, prices
- Body: DM Sans — paragraphs, nav, labels, buttons, form fields
- Scale: hero `text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground`, body `text-base md:text-lg`

## Elevation & Depth

Layered warm surfaces: cream page → beige section → milk-white cards, with coffee-tinted shadows (`shadow-subtle`, `shadow-elevated`, `shadow-coffee-glow`) instead of neutral grey, plus a soft warm gradient on hero and footer bands.

## Structural Zones

| Zone    | Background          | Border      | Notes                                                        |
| ------- | ------------------- | ----------- | ------------------------------------------------------------ |
| Header  | `bg-card/95` blur   | `border-b`  | Sticky; brand wordmark left, nav + caramel Order pill right  |
| Content | `bg-background`     | —           | Alternate `bg-muted/50` for every other section (menu, story) |
| Footer  | `bg-primary` (dark) | `border-t`  | Cream text on deep coffee; multi-column links + hours + ₱ note |

## Spacing & Rhythm

Sections breathe at `py-16 md:py-24`, content maxes at `container` with `px-4 sm:px-6`, grids gap `gap-6 md:gap-8`, and micro-spacing uses `space-y-3`/`gap-2` for label-to-heading and price-to-button pairs.

## Component Patterns

- Buttons: pill-shaped (`rounded-full`), primary = deep coffee fill with cream text, accent = caramel fill for "Order Now"/"Add to Cart", outline variant for secondary; hover lifts with `shadow-elevated` + slight scale.
- Cards: `rounded-2xl` milk-white, `border-border`, `shadow-subtle` at rest → `shadow-elevated` on hover, image area on `bg-muted` with `rounded-xl`.
- Badges: `rounded-full` small uppercase tracked; accent-tinted for "Bestseller"/"New", muted for categories, success-tinted for "Available".

## Motion

- Entrance: sections fade in and rise 14px via `animate-fade-in-up` (0.6s, staggered ~80ms per card).
- Hover: cards lift and shadow deepens over 300ms; buttons shift fill `--transition-smooth`.
- Decorative: `animate-steam-rise` on hero cup, `animate-gentle-float` on decorative beans/blobs; all respect `prefers-reduced-motion`.

## Constraints

- Only bundled fonts (Fraunces, DM Sans) — no CDN imports or system fallbacks as primary.
- All prices formatted in Philippine Peso (₱), e.g. `₱150`; no foreign currency.
- Semantic tokens only — never raw hex, `rgb()`, or arbitrary `bg-[#...]` classes in components.
- Mobile-first responsive at `sm`/`md`/`lg`; touch targets ≥ 44px.
- No customer accounts, no real GCash/Maya gateway, no email/SMS notifications.

## Signature Detail

The rising-steam motif — a soft animated curl above hero and product coffee imagery — paired with Fraunces display type over tracked uppercase micro-labels, giving the site a warm, lived-in café signature.

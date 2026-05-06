# Graph Report - tattooshopcol  (2026-05-06)

## Corpus Check
- 18 files · ~4,978 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 68 nodes · 52 edges · 19 communities (12 shown, 7 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78a8a36f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `TattooShop Colombia` - 10 edges
2. `Key Features` - 4 edges
3. `Configuration` - 3 edges
4. `isCityEligibleForCashOnDelivery()` - 2 edges
5. `Getting Started` - 2 edges
6. `Project Structure` - 2 edges
7. `Cash on Delivery Logic` - 2 edges
8. `WhatsApp Integration` - 2 edges
9. `Color Scheme` - 2 edges
10. `TattooShop Colombia` - 2 edges

## Surprising Connections (you probably didn't know these)
- `TattooShop Colombia` --references--> `Tailwind CSS`  [INFERRED]
  README.md → tailwind.config.js
- `TattooShop Colombia` --references--> `Next.js 14+`  [INFERRED]
  README.md → package.json
- `Reviews Section Component` --conceptually_related_to--> `Trust-based Design System`  [INFERRED]
  app/components/ReviewsSection.tsx → app/layout.tsx
- `Product Card Component` --conceptually_related_to--> `JSON-based Product Management`  [INFERRED]
  app/components/ProductCard.tsx → app/components/ProductGrid.tsx

## Hyperedges (group relationships)
- **E-commerce Core Flow** — productgrid_tsx, productcard_tsx, checkoutform_tsx, paymentmethods_tsx [INFERRED 0.85]
- **E-commerce Core Flow** — productgrid_tsx, productcard_tsx, checkoutform_tsx, paymentmethods_tsx [INFERRED 0.85]

## Communities (19 total, 7 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.18
Nodes (10): code:bash (# Install dependencies), code:block2 (app/), Features, Future Enhancements, Getting Started, Loading States, Project Structure, Responsive Design (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (5): Cash on Delivery Logic, code:block3 (⚠️ verifica con nosotros si hay disponibilidad de Pago contr), Key Features, Product Tags, Trust Badges

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (5): code:javascript (const WHATSAPP_NUMBER = '573001234567'; // Your WhatsApp bus), code:javascript (colors: {), Color Scheme, Configuration, WhatsApp Integration

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (3): Next.js 14+, Tailwind CSS, TattooShop Colombia

## Knowledge Gaps
- **22 isolated node(s):** `Features`, `Tech Stack`, `code:bash (# Install dependencies)`, `code:block2 (app/)`, `code:block3 (⚠️ verifica con nosotros si hay disponibilidad de Pago contr)` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TattooShop Colombia` connect `Community 1` to `Community 4`, `Community 5`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Key Features` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `Configuration` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `Features`, `Tech Stack`, `code:bash (# Install dependencies)` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
# Graph Report - c:/Users/nvz9/Desktop/tattooshopcol-web/tattooshopcol  (2026-05-06)

## Corpus Check
- Corpus is ~4,936 words - fits in a single context window. You may not need a graph.

## Summary
- 47 nodes · 32 edges · 17 communities (10 shown, 7 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 2,000 input · 700 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `isCityEligibleForCashOnDelivery()` - 2 edges
2. `TattooShop Colombia` - 2 edges
3. `Tailwind CSS` - 1 edges
4. `Trust-based Design System` - 1 edges
5. `JSON-based Product Management` - 1 edges
6. `Next.js 14+` - 1 edges
7. `Product Card Component` - 1 edges
8. `Reviews Section Component` - 1 edges
9. `Colombian Logistics` - 0 edges
10. `Wompi Payment Integration` - 0 edges

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

## Communities (17 total, 7 thin omitted)

### Community 4 - "Community 4"
Cohesion: 0.67
Nodes (3): Next.js 14+, Tailwind CSS, TattooShop Colombia

## Knowledge Gaps
- **10 isolated node(s):** `Tailwind CSS`, `Trust-based Design System`, `Colombian Logistics`, `Wompi Payment Integration`, `JSON-based Product Management` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `TattooShop Colombia` (e.g. with `Next.js 14+` and `Tailwind CSS`) actually correct?**
  _`TattooShop Colombia` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Tailwind CSS`, `Trust-based Design System`, `Colombian Logistics` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
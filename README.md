# TattooShop Colombia

A high-trust e-commerce platform for the Colombian tattoo supplies market with secure payments, localized logistics, and conversational sales.

## Features

✨ **High-Trust UI/UX**
- Professional design with security colors (Deep Blue/Green)
- Sticky header with trust messaging
- SSL, Wompi, and PSE badges at checkout
- Manual reviews section with star ratings

📦 **Product Management**
- JSON-based product structure with tags
- Auto-grouping into sections (Bestsellers, New Arrivals, etc.)
- Responsive grid layout (Mobile-first)

🇨🇴 **Colombian Logistics**
- Complete city selector with all Colombian municipalities
- Cash on Delivery (Contra Entrega) whitelist:
  - Bogotá (+ suburbs: Soacha, Chía, Cajicá, Mosquera)
  - Medellín (+ suburbs: Envigado, Itagüí, Sabaneta, Bello)
  - Cali (+ suburbs: Jamundí, Palmira, Yumbo, Candelaria)
  - Barranquilla (+ suburbs: Soledad, Puerto Colombia, Malambo, Galapa)
- Dynamic payment options based on delivery location

💳 **Secure Payments**
- Wompi integration (PSE, Nequi, Daviplata, Card)
- Mock payment gateway
- Loading states for payment buttons

💬 **Conversational Sales**
- Floating WhatsApp button with pre-filled messages
- Context-aware messaging for unavailable areas

## Tech Stack

- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS
- **Language**: TypeScript/JavaScript
- **Payments**: Wompi (integrated)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
app/
├── components/
│   ├── Header.tsx              # Sticky header with trust messaging
│   ├── ProductGrid.tsx         # Product listing with filtering
│   ├── ProductCard.tsx         # Individual product card
│   ├── ReviewsSection.tsx      # Customer reviews showcase
│   ├── CheckoutForm.tsx        # Checkout with city selector
│   ├── CitySelector.tsx        # Colombian city dropdown
│   ├── PaymentMethods.tsx      # Payment option selector
│   └── WhatsAppButton.tsx      # Floating WhatsApp button
├── data/
│   ├── products.json           # Product catalog
│   ├── reviews.json            # Customer reviews
│   └── colombianCities.json    # All Colombian cities with eligibility
├── utils/
│   └── cashOnDeliveryChecker.js # City eligibility logic
├── layout.tsx                  # Root layout
├── page.tsx                    # Home page
└── checkout/
    └── page.tsx               # Checkout page
```

## Key Features

### Cash on Delivery Logic
Automatically hides "Pago Contra Entrega" for cities outside the whitelist and shows:
```
⚠️ verifica con nosotros si hay disponibilidad de Pago contra entrega.
[Contactar Ventas WhatsApp]
```

### Trust Badges
- 🔒 SSL Encryption
- 💳 Wompi Secure
- 🏦 PSE ACH
- 📱 Nequi Billetera

### Product Tags
Auto-groups products by tags:
- ⭐ Bestsellers
- 🆕 New Arrivals
- 👑 Premium
- 📦 Essentials

## Configuration

### WhatsApp Integration
Update the WhatsApp number in components:
```javascript
const WHATSAPP_NUMBER = '573001234567'; // Your WhatsApp business number
```

### Color Scheme
Customizable in `tailwind.config.js`:
```javascript
colors: {
  'trust-dark': '#0F3460',   // Deep Blue
  'trust-green': '#16A085',  // Trust Green
  'trust-light': '#ECF0F1',  // Light Background
}
```

## Loading States
All interactive buttons include spinner animations:
- Product "Add to Cart" button
- "Finalizar Compra Segura" (Secure Checkout)
- Payment method selection

## Responsive Design
- Mobile-first approach
- Fully responsive on all breakpoints
- Touch-friendly UI

## Future Enhancements
- Wompi widget integration for live payment processing
- User authentication and order history
- Product inventory management
- Email notifications
- Analytics integration

---

Built with ❤️ for the Colombian tattoo community.
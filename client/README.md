# 🛒 Feasto Client (Customer Storefront & Rider Web App)

The customer-facing e-commerce storefront and delivery driver portal built with **React 19**, **Vite 7**, **MapLibre GL**, **Socket.IO**, and **Stripe Payments**.

## 🚀 Key Features

* **Interactive Menu & Category Navigation**: Filter dishes by culinary categories with dynamic state management via `StoreContext`.
* **Real-Time GPS Tracking Map**: Powered by `MapLibre GL` and `Socket.IO`, rendering live rider coordinates, store pickup locations, delivery destinations, and dynamic polylines.
* **Gemini AI Recipe Assistant (Foodbot)**: Natural language conversational search mapping meal recommendations into structured dish cards with instant cart actions.
* **HTML5 Canvas Gamification**: Scratchcard discount unlock using real-time pixel opacity erasure math (`Uint8ClampedArray`).
* **Delivery Rider Portal**: Onboarding form, live online/offline toggle, order acceptance queue, earnings overview, and Google Maps navigation launcher.

## 🛠️ Tech Stack

* **UI Framework**: React 19, React Router DOM 7
* **Build Tool**: Vite 7
* **Real-Time WebSockets**: `socket.io-client` 4.8.3
* **Maps & Geolocation**: MapLibre GL 5.24.0, `@vis.gl/react-maplibre` 8.1.1
* **HTTP Client**: Axios 1.13.2
* **Styling**: Vanilla CSS3 (Custom properties, HSL color tokens, Glassmorphism gradients)

## 🏃 Local Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

The application will run on `http://localhost:5173`.

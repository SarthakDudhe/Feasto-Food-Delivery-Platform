# 🍳 Feasto: Premium Food Delivery Platform, Real-Time Rider Logistics & AI Assistant

<div align="center">

<!-- Animated Banner Placeholder -->
[![Feasto Banner](https://github.com/user-attachments/assets/28a43d7f-89b0-472e-8037-0c32e4ea9435)](https://github.com/SarthakDudhe/Feasto-Food-Delivery-Platform)

<br />

<!-- Logo & Subtitle -->
<img width="110" alt="Feasto Logo" src="https://github.com/user-attachments/assets/7d579b8e-5da1-48b6-ba26-1b493e018ee4" />

<h3>Enterprise Full-Stack Food Delivery Ecosystem, Real-Time Rider Logistics Stream, Gemini AI Recipe Assistant & Operations Workspace.</h3>

<p>
  <strong>A Recruiter-Focused Senior Engineering Showcase</strong><br />
  Built with React 19, Express 5, MongoDB, Socket.IO WebSockets, MapLibre GL, Stripe Checkout, HTML5 Canvas, and Google Gemini AI.
</p>

<!-- Badge Grid -->
<p>
  <a href="https://github.com/SarthakDudhe/Feasto-Food-Delivery-Platform/actions"><img src="https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge&logo=github-actions&logoColor=white" alt="Build Status" /></a>
  <a href="https://github.com/SarthakDudhe/Feasto-Food-Delivery-Platform/releases"><img src="https://img.shields.io/badge/Version-1.2.0-f97316?style=for-the-badge" alt="Version Badge" /></a>
  <a href="https://github.com/SarthakDudhe/Feasto-Food-Delivery-Platform/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-3b82f6?style=for-the-badge" alt="License" /></a>
  <img src="https://img.shields.io/badge/RealTime-Socket.IO-black?style=for-the-badge&logo=socket.io" alt="Socket.IO Badge" />
  <img src="https://img.shields.io/badge/Maps-MapLibre_GL-0075ff?style=for-the-badge&logo=maplibre" alt="MapLibre Badge" />
  <img src="https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google" alt="Gemini AI Badge" />
  <img src="https://img.shields.io/badge/Architecture-Monorepo-8b5cf6?style=for-the-badge" alt="Monorepo Badge" />
</p>

<p>
  <a href="#-visual-product-gallery">Visual Gallery</a> •
  <a href="#-why-this-project-matters">Product Market Fit</a> •
  <a href="#-discovered-features--product-workflows">Feature Showcase</a> •
  <a href="#-system-architecture--communication-flow">System Architecture</a> •
  <a href="#-technical-excellence--engineering-highlights">Technical Excellence</a> •
  <a href="#-database-schema">Database Design</a> •
  <a href="#-api-endpoints-reference">API Reference</a> •
  <a href="#-local-installation--developer-guide">Installation Guide</a>
</p>

</div>

---

## 📽️ Visual Product Gallery

Here are the visual checkpoints demonstrating the warm diner aesthetic (`#fff9f5`, `#ff5a3d`, `#efdcd3`) across the customer storefront, real-time rider dashboard, and admin operations workspace.

| Interface View | Recommended Mockup / Screenshot Specs | Engineering & UI Focus |
| :--- | :--- | :--- |
| **Storefront & Menu Explorer** | `[Hero Banner: 1400x600px]` Landing page with banner carousel, category filtering grid, and food cards. | Demonstrates responsive CSS grid fluidity and dynamic context hydration. |
| **Real-Time MapLibre Tracking Map** | `[Map View: 1400x600px]` Live MapLibre GL map with custom animated rider markers, pickup pins, and route polyline overlay. | Highlights WebSockets (`Socket.IO`), geolocation streaming, and dynamic map bounds calculation. |
| **Rider Operations Portal & Dashboard** | `[Rider Workspace: 1400x600px]` Driver portal for order acceptance, earnings metrics, navigation trigger, and active delivery toggles. | Showcases driver lifecycle management, online status polling, and real-time state broadcasts. |
| **Gemini AI Recipe Assistant (Foodbot)** | `[Chat Bot View: 1400x600px]` Conversational AI chat rendering structured dish cards with instant add-to-cart buttons. | Demonstrates LLM system prompt engineering, schema JSON extraction, and client cart sync. |
| **Gamified HTML5 Scratch Card** | `[Canvas Interaction: 1400x600px]` Metallic scratchcard overlay revealing golden discount codes based on pixel erase thresholds. | Highlights HTML5 `<canvas>` pixel manipulation (`Uint8ClampedArray`) and math thresholds. |
| **Split-Screen Admin Workspace & KOT** | `[Admin Dashboard: 1400x600px]` Dual-pane admin workspace with packer item checklist, rider assignment, and KOT receipt printing. | Demonstrates split-pane layout, thermal receipt CSS print media formatting, and kitchen workflows. |
| **Custom SVG Revenue Analytics** | `[Dashboard Analytics: 1400x600px]` Handcrafted SVG area chart displaying weekly sales trends with interactive vector tooltips. | Proves native SVG path plotting without third-party charting libraries. |

---

## 🎯 Why This Project Matters

Most student or boilerplate food delivery clones are simple "read-only lists" attached to basic Stripe checkouts. They lack the real-world operational logistics, real-time sync, and intelligent agent features required by modern multi-sided delivery platforms (DoorDash, UberEats, Deliveroo):

* **The Logistics & Dispatch Gap:** Delivery couriers require a real-time dispatch mechanism, live GPS location broadcasts, and interactive MapLibre map interfaces to navigate to customers efficiently.
* **The Operational & Kitchen Gap:** Restaurant staff cannot manage high-volume orders using basic grids; they require **split-pane inspector views**, **item-by-item packer checklists**, and printable **Kitchen Order Tickets (KOT)** for line cooks.
* **The Conversational Commerce Gap:** Text searches often fail when customers want meal recommendations based on diet or mood. Integrating an intelligent **Gemini AI assistant** transforms recipe discovery into instant cart conversions.
* **The Engagement & Gamification Gap:** Flat promotional codes suffer from low engagement. Gamification via **HTML5 Canvas scratchcards** elevates coupon claim rates and conversion metrics.
* **The Value Proposition:** **Feasto** bridges the multi-sided platform gap between **Customers**, **Riders**, and **Restaurant Managers**. It provides a fully realized monorepo ecosystem with WebSockets, AI, interactive mapping, and financial analytics.

---

## ✨ Discovered Features & Product Workflows

### 1. Customer Storefront & Commerce
* **Dynamic Menu & Cart Synchronization**:
  - Context-driven item filtering with persistent state in `StoreContext.jsx`.
  - Automatic synchronization of cart quantities to MongoDB for authenticated users.
* **Stripe Secure Checkout Session**:
  - Direct integration with Stripe API for secure payment processing.
  - Server verification webhook/callback endpoint ([orderController.js](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/server/controllers/orderController.js)) updating payment status instantly.

### 2. Real-Time Rider Logistics & MapLibre GL Integration
* **Live GPS Tracking with MapLibre GL**:
  - Integrates `@vis.gl/react-maplibre` and `maplibre-gl` for real-time map rendering ([DeliveryMap.jsx](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/client/src/components/DeliveryMap/DeliveryMap.jsx)).
  - Renders animated scooter markers 🛵, store pickup location pins, customer delivery destinations, and custom polylines.
* **Socket.IO Real-Time Dispatch System**:
  - Bi-directional WebSocket connection streaming live driver coordinates and status updates across client, rider, and admin applications.
  - Instant status transitions: `Food Processing` ➔ `Rider Assigned` ➔ `Out for Delivery` ➔ `Delivered`.
* **Dedicated Rider Portal**:
  - Driver onboarding and profile management ([RiderSignup.jsx](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/client/src/pages/RiderSignup/RiderSignup.jsx), [RiderDashboard.jsx](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/client/src/pages/RiderDashboard/RiderDashboard.jsx)).
  - Live availability toggle (`online`/`offline`), earnings tracker, accepted orders feed, and one-click Google Maps navigation triggers.

### 3. Conversational AI Assistant (Foodbot)
* **Google Gemini AI Integration**:
  - Powered by `@google/genai` API SDK with structured system prompts ([aiController.js](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/server/controllers/aiController.js)).
  - Interprets natural language requests ("I want a healthy low-carb dinner under $20") and matches them against live database food catalog items.
  - Renders response text along with a **horizontal scrollable dish card carousel** enabling direct "Add to Cart" execution.

### 4. HTML5 Canvas Gamification (ScratchCard)
* **Interactive Metallic Scratch Card**:
  - Built with HTML5 `<canvas>` rendering metallic golden gradients ([ScratchCard.jsx](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/client/src/components/ScratchCard/ScratchCard.jsx)).
  - Uses `globalCompositeOperation = 'destination-out'` to simulate realistic scratching.
  - Calculates erased pixel density via `getImageData()`. Once scratch threshold exceeds 45%, triggers confetti celebration and auto-applies discount code.

### 5. Operations Admin Workspace & Kitchen Logistics
* **Dual-Pane Split Workspace**:
  - Orders workspace ([Order.jsx](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/admin/src/pages/Orders/Order.jsx)) featuring a left-side chronological orders sidebar and right-side detail inspector.
  - Packer checklists allowing staff to check off individual items before dispatch.
  - Driver assignment modal for manual dispatch to registered riders.
* **Thermal KOT (Kitchen Order Ticket) Printing**:
  - Custom CSS `@media print` rules format the page into an 80mm thermal receipt ticket, stripping all UI controls and navigation bars.
* **Rider Management Panel**:
  - Admin controls ([ManageRiders.jsx](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/admin/src/pages/ManageRiders/ManageRiders.jsx)) for reviewing applicant riders, verifying credentials, and toggling active approval status.
* **SVG Vector Analytics Dashboard**:
  - Native SVG area and line trend graphs ([Dashboard.jsx](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/admin/src/pages/Dashboard/Dashboard.jsx)) calculating sales velocity, average order values, and category breakdowns without external chart libraries.
---

## 🛠️ Technology Ecosystem

### Frontend Applications (`client/` & `admin/`)
* **Framework**: React 19.2.0, Vite 7, React Router DOM 7
* **Real-Time WebSockets**: `socket.io-client` 4.8.3
* **Map & Geolocation**: MapLibre GL 5.24.0, `@vis.gl/react-maplibre` 8.1.1
* **Styling**: Vanilla CSS3 (Custom properties, HSL color tokens, Glassmorphism gradients, Flexbox/Grid)
* **HTTP & State**: Axios 1.13.2, React Context API (`StoreContext`)
* **Interactive Components**: HTML5 Canvas pixel manipulation, custom SVG vector graphs

### Backend API Server (`server/`)
* **Runtime & Framework**: Node.js ESM, Express 5.2.1
* **Database & ODM**: MongoDB, Mongoose 9.0.1
* **Real-Time Gateway**: Socket.IO 4.8.3 bi-directional event engine
* **AI Engine Integration**: Google Gemini AI (`@google/genai` 1.39.0)
* **Payment Gateway**: Stripe SDK 20.0.0 (Checkout session creation & verification)
* **Authentication & Hashing**: JSON Web Token (JWT) 9.0.3, Bcrypt 6.0.0, Validator 13.15.23
* **File Processing**: Multer 2.0.2 disk storage engine

---

## 📐 System Architecture & Communication Flow

### Multi-Tier Architecture Diagram
```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Application Layer"]
        C[Customer Storefront<br/>React 19 + Context]
        R[Rider Portal<br/>React 19 + MapLibre]
        A[Admin Dashboard<br/>React 19 + SVG Charts]
    end

    subgraph GatewayLayer["Express 5 REST & WebSocket Gateway"]
        E[Express Server]
        SIO[Socket.IO Server Engine]
        AuthM[JWT Auth Middleware]
        OrderC[Order Controller]
        RiderC[Rider Controller]
        AIC[Gemini AI Controller]
    end

    subgraph ServiceLayer["Database & Third-Party Engines"]
        DB[(MongoDB Atlas)]
        STRIPE[Stripe Payment Portal]
        GEMINI[Google Gemini AI Engine]
        FS[(Disk File Uploads)]
    end

    C -->|REST API| E
    R -->|REST API| E
    A -->|REST API| E

    C <-->|Bi-Directional Events| SIO
    R <-->|GPS Coordinate Stream| SIO
    A <-->|Live Dispatch Updates| SIO

    E --> AuthM
    AuthM --> OrderC
    AuthM --> RiderC
    AuthM --> AIC

    OrderC -->|Orders / Payments| DB
    RiderC -->|Riders / Coordinates| DB
    OrderC -->|Checkout Sessions| STRIPE
    AIC -->|Recipe Context Prompts| GEMINI
    E -->|Multer Asset Uploads| FS
```

### Real-Time Rider Dispatch & Delivery Sequence
```mermaid
sequenceDiagram
    participant Customer as Customer Client
    participant Server as Express Server
    participant Socket as Socket.IO Engine
    participant Rider as Delivery Rider App
    participant Admin as Admin Dashboard

    Customer->>Server: POST /api/order/place (Cart Items, Address)
    Server->>Admin: Broadcast 'new_order' event via Socket.IO
    Admin->>Server: PUT /api/rider/assign (orderId, riderId)
    Server->>Socket: Emit 'order_assigned' to assigned rider
    Rider->>Socket: Emit 'rider_location_update' (lat, lng, speed)
    Socket-->>Customer: Push real-time coordinate update to MapLibre Map
    Rider->>Server: PUT /api/order/status (orderId, 'Delivered')
    Server->>Socket: Emit 'order_delivered' event
    Socket-->>Customer: Trigger victory confetti & complete tracking timeline
```

---

## ⚡ Technical Excellence & Engineering Highlights

* **Real-Time WebSocket Architecture**: Built a scalable Socket.IO communication bridge allowing delivery drivers to stream live GPS coordinates directly to customer tracking maps with minimal latency.
* **Declarative MapLibre GL Integration**: Replaced static map embeds with interactive MapLibre vector maps rendering dynamic driver markers, pickup hubs, delivery drop-offs, and automatic map view bounds recalculation.
* **LLM Schema Enforcement**: Built robust system prompts for Google Gemini AI that enforce strict JSON output validation, ensuring natural language queries translate cleanly into executable dish recommendations.
* **Canvas Erase Density Calculations**: Developed pixel-level math routines using `Uint8ClampedArray` to calculate alpha opacity changes during scratchcard manipulation, preventing manual code inspection cheating.
* **Zero-Dependency SVG Data Visualizations**: Built custom vector charting primitives (`<circle>`, `<path>`, `<linearGradient>`) for financial dashboard metrics, eliminating external charting dependencies while maintaining full responsiveness.
* **CSS Print Media Thermal Formatting**: Engineered custom `@media print` CSS rules targeting 80mm thermal receipt printers, formatting kitchen order tickets instantly on `window.print()`.

---

## 📊 Database Schema

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    FOOD ||--o{ ORDER : contains
    RIDER ||--o{ ORDER : delivers

    USER {
        ObjectId _id PK
        string name "Required"
        string email "Unique, Validator verified"
        string password "Bcrypt hashed"
        object cartData "Key-value quantity map"
    }

    FOOD {
        ObjectId _id PK
        string name "Required"
        string description "Dish description text"
        number price "Decimal amount"
        string image "Saved filename string"
        string category "Inventorial group"
    }

    RIDER {
        ObjectId _id PK
        string name "Driver full name"
        string email "Unique driver email"
        string phone "Contact phone number"
        string vehicleType "Bike / Scooter / Car"
        string status "Pending / Approved / Rejected"
        boolean isAvailable "Online status toggle"
        object currentLocation "Lat, Lng coordinates"
    }

    ORDER {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId riderId FK
        array items "Food item list with quantities"
        number amount "Final charged total"
        object address "Delivery street, city, pincode"
        object coupon "Applied promo code details"
        string status "Food Processing / Rider Assigned / Out for Delivery / Delivered"
        date date "Created timestamp"
        boolean payment "Stripe verification flag"
    }
```

---

## 🔌 API Endpoints Reference

### Authentication & Users (`/api/user`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/register` | Register a new customer account | No |
| `POST` | `/api/user/login` | Authenticate user and return JWT token | No |

### Food Catalog (`/api/food`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/food/add` | Upload image and create food item | Admin |
| `GET` | `/api/food/list` | Retrieve all food items from catalog | No |
| `POST` | `/api/food/remove` | Delete a food item by ID | Admin |

### Shopping Cart (`/api/cart`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cart/add` | Increment item quantity in cart | Yes (JWT) |
| `POST` | `/api/cart/remove` | Decrement item quantity in cart | Yes (JWT) |
| `POST` | `/api/cart/get` | Retrieve user cart contents | Yes (JWT) |

### Orders & Checkout (`/api/order`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/order/place` | Create order & generate Stripe checkout session | Yes (JWT) |
| `POST` | `/api/order/verify` | Verify Stripe session & confirm payment | Yes (JWT) |
| `POST` | `/api/order/userorders` | Fetch user order history | Yes (JWT) |
| `GET` | `/api/order/list` | List all orders for admin panel | Admin |
| `POST` | `/api/order/status` | Update order progress status | Admin / Rider |

### Delivery Rider Operations (`/api/rider`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/rider/register` | Submit driver application | No |
| `POST` | `/api/rider/login` | Authenticate rider profile | No |
| `GET` | `/api/rider/list` | List all registered drivers | Admin |
| `POST` | `/api/rider/approve` | Approve driver application status | Admin |
| `POST` | `/api/rider/location` | Stream live GPS location coordinates | Rider |

### Conversational AI (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Query Gemini AI for recipe & dish recommendations | No |

---

## 🏆 Key Achievements & Resume Highlights

```text
• Engineered a multi-sided food delivery monorepo serving Customers, Drivers, and Admins using React 19, Express 5, and MongoDB.
• Integrated Socket.IO WebSockets and MapLibre GL for real-time driver GPS coordinate streaming and live map tracking.
• Implemented Google Gemini AI recipe assistant using structured JSON output prompts, parsing dish recommendations directly into cart actions.
• Built interactive HTML5 Canvas scratchcard gamification calculating real-time pixel erasure density to unlock coupon codes.
• Handcrafted responsive SVG area chart components for financial revenue tracking without external charting library bloat.
• Configured automated thermal receipt (KOT) printing using CSS print media directives, stripping UI layout elements on demand.
```

---

## 📁 Monorepo Directory Layout

```text
Feasto-Food-Delivery-Platform/
├── client/                     # Customer & Rider React Application
│   ├── src/
│   │   ├── components/         # Navbar, Footer, DeliveryMap, ScratchCard, FoodDisplay
│   │   ├── context/            # Global StoreContext state provider
│   │   ├── pages/              # Home, Cart, PlaceOrder, TrackOrder, Foodbot, RiderDashboard
│   │   └── utils/              # Map helpers and utility functions
│   └── index.html
├── admin/                      # Operations Admin Panel
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar panel
│   │   ├── pages/              # Add menu, List inventory, Orders split pane, ManageRiders, Dashboard
│   │   └── assets/             # Operational static assets
│   └── index.html
├── server/                     # Node.js + Express API Backend
│   ├── configs/                # MongoDB Mongoose configurations
│   ├── controllers/            # Auth, Cart, Food catalog, Order workflows, Rider operations, AI
│   ├── middleware/             # Header JWT authentication middleware
│   ├── models/                 # Mongoose schemas (User, Food, Order, Rider)
│   ├── routes/                 # Express Router mappings
│   ├── prompt/                 # Google Gemini system prompts
│   └── server.js               # Express + Socket.IO Server Entry Point
└── README.md                   # Project documentation (this file)
```

---

## 🗝️ Environment Configuration

Create a `.env` file inside the `server/` directory:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster.mongodb.net/feasto
JWT_SECRET=your_super_secure_jwt_secret_token
STRIPE_SECRET_KEY=sk_test_your_stripe_private_secret_key
GEMINI_API_KEY=AIzaSyYourGeminiAIKeyForRecipeAssistant
```

---

## 🚀 Local Installation & Developer Guide

### Step 1: Clone the Project
```bash
git clone https://github.com/SarthakDudhe/Feasto-Food-Delivery-Platform.git
cd Feasto-Food-Delivery-Platform
```

### Step 2: Set Up and Run Server
```bash
cd server
npm install
npm run server
```
The backend API and Socket.IO server will start on `http://localhost:4000`.

### Step 3: Set Up and Run Customer & Rider App
```bash
cd ../client
npm install
npm run dev
```
The client app will start on Vite's default dev port: `http://localhost:5173`.

### Step 4: Set Up and Run Admin Workspace
```bash
cd ../admin
npm install
npm run dev
```
The admin portal will launch on: `http://localhost:5174`.

---

## 📄 License
This project is licensed under the **MIT License**. See the [LICENSE](file:///c:/Users/saksh/Desktop/MY%20PROJECTS/Feasto-Food%20Delivery%20Platform/LICENSE) file for details.

---

## 📧 Contact & Developer Info

* **GitHub:** [SarthakDudhe](https://github.com/SarthakDudhe)
* **LinkedIn:** [Sarthak Dudhe](https://www.linkedin.com/in/sarthak-dudhe-67155a327)
* **Portfolio:** [Portfolio Website](https://portfolio-sarthak-beta.vercel.app/)
* **Email:** `sarthakdudhe79@gmail.com`


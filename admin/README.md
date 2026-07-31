# 📊 Feasto Admin (Operations Workspace & Analytics Dashboard)

The restaurant management and operations dashboard built with **React 19**, **Vite 7**, **Custom SVG Analytics**, and **CSS Thermal Print directives**.

## 🚀 Key Features

* **Dual-Pane Split Workspace**: Real-time incoming order queue paired with a detailed inspector panel for driver dispatch and order processing.
* **Packer Item Checklists**: Interactive item checkboxes for kitchen packing verification before dispatch.
* **Thermal KOT (Kitchen Order Ticket) Printing**: Formatted 80mm thermal receipt slip generation using custom `@media print` directives.
* **Rider Management System**: Review applicant riders, verify credentials, and approve driver active status.
* **Native SVG Financial Analytics**: Zero-dependency vector line and area trend charts mapping weekly revenue, transaction counts, and average order values.

## 🛠️ Tech Stack

* **UI Framework**: React 19, React Router DOM 7
* **Build Tool**: Vite 7
* **HTTP Client**: Axios 1.13.2
* **Notifications**: React Toastify 11.0.5
* **Data Visualization**: Handcrafted SVG vector primitives (`<circle>`, `<path>`, `<linearGradient>`)

## 🏃 Local Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

The application will run on `http://localhost:5174`.

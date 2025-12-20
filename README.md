
# 🍽️ Feasto – Full Stack Food Ordering Platform (MERN)

🚀 **Live Project:** https://feasto-food-delivery-platform.onrender.com/  
📂 **GitHub Repository:** [https://github.com/yourusername/feasto](https://github.com/SarthakDudhe/Feasto-Food-Delivery-Platform)

---

## 🖼️ Project Preview

<p align="center">
  <img width="1898" height="867" alt="Screenshot 2025-12-20 145040" src="https://github.com/user-attachments/assets/6f9fe488-83c1-4eee-a5e2-f82aec5ac569" />

  <br/><br/>
 <img width="1895" height="868" alt="Screenshot 2025-12-20 145135" src="https://github.com/user-attachments/assets/40ba4b9b-e991-4e7a-84dc-8ed0e7d2b763" />

  <br/><br/>
  <img width="1899" height="870" alt="Screenshot 2025-12-20 145203" src="https://github.com/user-attachments/assets/1bc763f5-2e4e-4aee-b4c4-992e5f9dfd0a" />

  <br/><br/>
  <img width="1899" height="868" alt="Screenshot 2025-12-20 145111" src="https://github.com/user-attachments/assets/c69a9b6b-a5d8-4e53-97d2-0608ecddee61" />

  <br/><br/>
  <img width="1902" height="867" alt="Screenshot 2025-12-20 145222" src="https://github.com/user-attachments/assets/77730379-5051-4b6d-b3a6-86116fc8ae03" />

  <br/><br/>
 <img width="1901" height="873" alt="Screenshot 2025-12-20 145814" src="https://github.com/user-attachments/assets/d83dd4b3-4984-4dca-92d2-19269318d1db" />

  <br/><br/>
 <img width="1899" height="868" alt="Screenshot 2025-12-20 145111" src="https://github.com/user-attachments/assets/86421631-3016-40f4-8f76-5bca1976356e" />

</p>


---

## 📖 About the Project

**Feasto** is a modern, full-stack food ordering web application built using the **MERN Stack**.  
It provides a seamless user experience for ordering food online, secure online payments using **Stripe**, real-time order tracking, and a powerful admin dashboard for managing products and orders.

---

## 🚀 Features

### 👤 User Side
- Browse food items by category
- Add / remove items from cart
- Dynamic cart total calculation
- Secure checkout flow
- Online payments using **Stripe**
- Order placement & tracking
- Order history
- Responsive & modern UI

### 🛠️ Admin Panel
- Add new food items with image upload
- List & delete food items
- View all customer orders
- Update order status:
  - Food Processing
  - Out for Delivery
  - Delivered
- Admin protected routes

---

## 🧩 Tech Stack

### Frontend
- React.js
- CSS / Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### Payments
- Stripe Payment Gateway

### Authentication
- JWT (JSON Web Token)

---

## 🏗️ Project Structure

```
Feasto/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── admin/
    ├── pages/
    └── components/
```

---

## 💳 Stripe Payment Integration

- Secure card payments using Stripe
- Backend payment intent creation
- Test & Live mode supported

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## 🔐 Environment Variables

Create a `.env` file in **backend/**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## 🛠️ Installation & Setup

### Clone the repository
```bash
git clone https://github.com/yourusername/feasto.git
cd feasto
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Admin Panel Setup
```bash
cd admin
npm install
npm run dev
```

---

## ✨ UI Highlights
- Premium clean layout
- Mobile responsive design
- Smooth checkout experience
- Modern admin dashboard

---

## 📌 Future Enhancements
- Live delivery tracking
- Ratings & reviews
- Push notifications
- Admin analytics dashboard
- Mobile app (React Native)

---

## 👨‍💻 Author

**YOURBOSS**  
Full Stack MERN Developer  

---

## ⭐ Support

If you like this project, don’t forget to **star ⭐ the repository**!

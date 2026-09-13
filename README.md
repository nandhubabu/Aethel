# Aethel 🛍️

> A premium, highly scalable, and futuristic E-Commerce platform built with a microservices architecture.

![Aethel Cover Image](./assets/cover.png)

## 🚀 Project Overview

**Aethel** is a modern e-commerce application designed to deliver a flawless, high-end shopping experience. The platform abandons generic templates in favor of a custom-built, futuristic design system. Under the hood, it leverages a robust **Microservices Architecture**, separating core functionalities from payment processing to ensure maximum scalability, security, and fault tolerance.

### 🌐 Live Demos
- **Frontend App:** [https://aethel-five-rouge.vercel.app/](https://aethel-five-rouge.vercel.app/)
- **Core API (Backend):** Hosted on Render
- **Payment API (Backend):** Hosted on Render

---

## ✨ Key Features

### User Experience (UI/UX)
- **Custom Design System:** Premium, glassmorphism-inspired UI with smooth transitions and gold gradient accents.
- **Dynamic Product Detail Page:** Immersive 2-column layout with sticky galleries, interactive quantities, and instant "Add to Cart" feedback.
- **Fully Responsive:** Perfectly optimized across mobile, tablet, and desktop environments.
- **Wishlist & Cart Management:** Seamlessly save items and manage checkout flows.

### Technical & Backend
- **Microservices Architecture:** 
  - `core-api`: Handles Users, Products, Carts, and Orders.
  - `payment-api`: Dedicated service for secure transaction handling.
- **Razorpay Integration:** Full payment gateway integration with secure webhook verification and HMAC hashing.
- **Automated Infrastructure Management:** Includes custom GitHub Actions (Cron Jobs) to maintain instance health and prevent cold starts on cloud providers.
- **JWT Authentication:** Secure stateless authentication and authorization (Customer vs. Vendor roles).

---

## 🏗 Architecture & Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Custom CSS with CSS Variables (No generic UI libraries)
- **Routing:** React Router v6
- **Icons:** Lucide React

### Backend (Node.js ecosystem)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Payment Gateway:** Razorpay SDK

### DevOps & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **CI/CD & Automation:** GitHub Actions

---

## ⚙️ Local Setup & Installation

To run this project locally, you will need to start the frontend and both backend services.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Razorpay Test Credentials

### 1. Clone the repository
```bash
git clone https://github.com/nandhubabu/Aethel.git
cd Aethel
```

### 2. Set up the Core API
```bash
cd core-api
npm install
```
Create a `.env` file in `core-api/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SERVICE_SECRET=your_service_secret
PAYMENT_SERVICE_URL=http://localhost:5001
```
Run the service: `npm run dev`

### 3. Set up the Payment API
```bash
cd ../payment-api
npm install
```
Create a `.env` file in `payment-api/`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SERVICE_SECRET=your_service_secret
CORE_SERVICE_URL=http://localhost:5000
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Run the service: `npm run dev`

### 4. Set up the Frontend
```bash
cd ../frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
Run the app: `npm run dev`

---

## 👨‍💻 Author

**Nandhu Babu**  
- GitHub: [@nandhubabu](https://github.com/nandhubabu)
- Portfolio: [https://nandhubabu.github.io/My_Portfolio/](https://nandhubabu.github.io/My_Portfolio/)

---
*If you like this project, please leave a ⭐ on the repository!*

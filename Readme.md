# 🚴‍♂️ Campus E-Cycle Rental System

A full-stack **Next.js + MongoDB** application for campus-based e-cycle rentals — allowing users to **book, unlock, ride, and return** electric cycles using a smart dock system.  
Built with **Next.js 14**, **MongoDB Atlas**, and **shadcn/ui**, it supports both **User** and **Admin** functionalities, including real-time status tracking, wallet management, and analytics.

---

## 🌐 Live Demo
[https://cycloan.vercel.app]

---

## 🧩 Features

### 👤 User Features
- **Signup / Login (JWT Authentication)**  
  Secure login system with hashed passwords using bcrypt.js.

- **View Stations & Available Cycles**  
  Displays all stations with real-time availability and location coordinates.

- **Reserve a Cycle (10-minute hold)**  
  Users can book a cycle before riding.

- **Unlock Using QR/ID**  
  Smart unlock simulation using a QR input system.

- **Ride & Return System**  
  - Ends trip when cycle is returned to a dock  
  - Auto fare deduction from wallet  
  - Battery depletion simulated

- **Wallet Management**  
  Recharge wallet and view remaining balance after each ride.

- **Trip History**  
  Displays all past rides with fare, duration, and distance.

---

### 🧠 Admin Features
- **Admin Dashboard** — shows system stats:
  - Total users, stations, bikes
  - Active rides and total revenue
- **Manage Stations** — Add, view, or delete stations.
- **Manage Bikes** — Add new e-cycles, track battery, and change status.
- **User Management** — View and manage users and wallets.

---

## 🧱 Tech Stack

| Layer | Technologies Used |
|--------|--------------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, shadcn/ui, Lucide Icons |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Authentication** | JWT + bcrypt.js |
| **Utilities** | uuid, axios, zod, next-themes |

---



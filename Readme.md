# CYCLOAN

Smart campus e-cycle rental system built with Next.js, MongoDB, and Tailwind CSS. The platform lets students reserve, unlock, ride, and return electric cycles, while giving admins a control panel for stations, bikes, users, and trip analytics.

[![Live Site](https://img.shields.io/badge/Live%20Demo-cycloan.vercel.app-16a34a?style=for-the-badge&logo=vercel)](https://cycloan.vercel.app)
[![Website](https://img.shields.io/website?down_message=offline&label=deployment&logo=vercel&style=for-the-badge&up_message=live&url=https%3A%2F%2Fcycloan.vercel.app)](https://cycloan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-149eca?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-0f9d58?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## Live Demo

Visit the deployed app here:

**https://cycloan.vercel.app**

## Overview

CYCLOAN is designed as a lightweight campus mobility platform. Users can authenticate, view available stations, reserve an e-cycle for a short hold period, unlock it, complete a ride, and pay using an in-app wallet. Admins can monitor usage and manage the fleet from a dedicated dashboard.

## Key Features

### User features

- Secure registration and login with JWT-based authentication
- Browse station availability and dock capacity in real time
- Reserve a bike with a 10-minute hold window
- Unlock a reserved bike using a QR/input flow
- Start and end trips with automatic fare calculation
- Wallet recharge flow for ride payments
- Trip history with distance, duration, and fare summaries
- Profile page with wallet and account details

### Admin features

- Dashboard with total bikes, stations, users, active trips, and revenue
- Manage stations
- Manage bikes and battery/status information
- View registered users
- Track completed and ongoing trips

## Ride Logic

- Base fare: `Rs.5`
- Usage fare: `Rs.1` per minute
- Reservation hold time: `10 minutes`
- Distance simulation: approximately `1 km` per `5 minutes`
- Battery drain simulation on ride completion

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui, Lucide React |
| Backend | Next.js App Router, Route Handlers |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Forms and validation | React Hook Form, Zod |
| UI utilities | Radix UI, Sonner, TanStack Table |
| Maps and location | Leaflet, React Leaflet |

## Project Structure

```text
app/
  admin/                 Admin dashboard and management pages
  api/[[...path]]/       Central API route handler
  dashboard/             User dashboard
  history/               Trip history
  login/ register/       Authentication pages
  profile/               Wallet and user profile
  reserve/ unlock/       Reservation and unlock flow
  return/ trip/          Ride completion and trip details
components/
  ui/                    Reusable shadcn/ui components
hooks/                   Custom React hooks
lib/
  models/                Mongoose models
  mongodb.js             Database connection
```

## Getting Started

### 1. Clone the project

```bash
git clone <your-repo-url>
cd "E-cycle Rental System"
```

### 2. Install dependencies

```bash
npm install
```

If you prefer Yarn:

```bash
yarn
```

### 3. Create environment variables

Create a `.env` file in the project root with:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=ecycleDB
JWT_SECRET=your_jwt_secret
```

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Seed Demo Data

This project includes a seed endpoint to quickly populate the database with sample stations, bikes, and users.

Call:

```text
GET /api/seed
```

After seeding, you can log in with:

- Admin: `admin@campus.com` / `admin123`
- User: `john@student.com` / `password123`

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | User/admin login |
| `/register` | New user registration |
| `/dashboard` | User dashboard |
| `/profile` | Wallet recharge and profile details |
| `/history` | Completed trip history |
| `/admin/dashboard` | Admin overview |
| `/admin/stations` | Station management |
| `/admin/bikes` | Bike management |
| `/admin/users` | User management |
| `/admin/trips` | Trip monitoring |

## API Highlights

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/seed` | Seed demo data |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive JWT |
| `GET` | `/api/auth/me` | Fetch current user |
| `GET` | `/api/stations` | List all stations |
| `POST` | `/api/reservations` | Reserve a bike |
| `POST` | `/api/unlock` | Start a trip |
| `POST` | `/api/return` | End a trip and deduct fare |
| `POST` | `/api/wallet/recharge` | Add wallet balance |
| `GET` | `/api/admin/stats` | Admin dashboard metrics |

## Deployment

The application is deployed on Vercel:

**https://cycloan.vercel.app**

For your own deployment, configure the same environment variables in Vercel or your hosting platform before building.

## Notes

- Authentication state is stored client-side using `localStorage`
- The project currently does not include an automated test suite
- The API is implemented through a single catch-all route handler at `app/api/[[...path]]/route.js`

## Author

Built for a smart campus mobility use case using Next.js and MongoDB.

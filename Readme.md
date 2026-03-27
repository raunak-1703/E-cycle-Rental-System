# CYCLOAN

A smart campus e-cycle rental platform built with Next.js 14, MongoDB, and Tailwind CSS. CYCLOAN lets users reserve, unlock, ride, and return electric cycles through a simple web app, while admins manage stations, bikes, users, and trip analytics from a dedicated dashboard.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cycloan.vercel.app-16a34a?style=for-the-badge&logo=vercel)](https://cycloan.vercel.app)
[![Deployment](https://img.shields.io/website?down_message=offline&label=deployment&logo=vercel&style=for-the-badge&up_message=live&url=https%3A%2F%2Fcycloan.vercel.app)](https://cycloan.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-149eca?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-0f9d58?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## Live Site

https://cycloan.vercel.app

## Overview

CYCLOAN is designed for campus mobility. Students can sign up, browse stations, reserve a bike, unlock it, complete a ride, and pay through a wallet system. Admins get a management panel for monitoring the fleet and reviewing system-wide usage.

## Features

### User Experience

- Register and log in with JWT-based authentication
- Browse stations and bike availability
- Reserve a bike with a 10-minute hold window
- Unlock the bike using the reservation flow
- Complete rides with automatic fare calculation
- Recharge wallet balance from the profile page
- Review trip history with fare, duration, and distance

### Admin Tools

- Dashboard with bikes, stations, users, active trips, and revenue
- Station management
- Bike management
- User management
- Trip monitoring and operational visibility

## Ride Logic

- Base fare: `Rs.5`
- Usage fare: `Rs.1` per minute
- Reservation hold period: `10 minutes`
- Simulated distance: roughly `1 km` per `5 minutes`
- Battery level decreases after ride completion

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui, Lucide React |
| Backend | Next.js App Router, Route Handlers |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Forms and validation | React Hook Form, Zod |
| UI utilities | Radix UI, Sonner, TanStack Table |
| Maps | Leaflet, React Leaflet |

## Project Structure

```text
app/
  admin/                 Admin pages
  api/[[...path]]/       Central API route handler
  dashboard/             User dashboard
  history/               Trip history
  login/ register/       Authentication pages
  profile/               Wallet and profile page
  reserve/ unlock/       Reservation and unlock flow
  return/ trip/          Ride and return flow
components/
  ui/                    Reusable UI components
hooks/                   Custom hooks
lib/
  models/                Mongoose models
  mongodb.js             Database connection
```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd "E-cycle Rental System"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=ecycleDB
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=*
```

### 4. Run the development server

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Seed Demo Data

The project includes a seed endpoint for quick local setup:

```text
GET /api/seed
```

Demo accounts after seeding:

- Admin: `admin@campus.com` / `admin123`
- User: `john@student.com` / `password123`

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | User and admin login |
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
| `GET` | `/api/seed` | Seed sample data |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive JWT |
| `GET` | `/api/auth/me` | Fetch current user |
| `GET` | `/api/stations` | List all stations |
| `POST` | `/api/reservations` | Reserve a bike |
| `POST` | `/api/unlock` | Start a trip |
| `POST` | `/api/return` | End a trip and deduct fare |
| `POST` | `/api/wallet/recharge` | Recharge the wallet |
| `GET` | `/api/admin/stats` | Admin dashboard metrics |

## Deployment

The app is deployed on Vercel:

https://cycloan.vercel.app

If you deploy your own copy, make sure the same environment variables are configured in your hosting platform before running `npm run build`.

## Notes

- Authentication state is stored client-side in `localStorage`
- The API currently lives in a single catch-all route: `app/api/[[...path]]/route.js`
- `next.config.js` is configured for standalone output and permissive CORS headers
- There is no automated test suite in this repository yet

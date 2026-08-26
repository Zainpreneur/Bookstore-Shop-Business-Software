# Bookstore Shop Business Software 📖

A full-stack e-commerce and back-office application for running a bookstore: a public shop
where customers browse, buy, and review books, and an admin back office for managing
inventory, orders, and customers.

## Tech stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19 + TypeScript + Vite + React Router + Tailwind CSS + Axios |
| Backend  | Node.js + Express + TypeScript |
| Database | SQLite via Prisma ORM (swap the datasource for Postgres/MySQL in production) |
| Auth     | JWT (JSON Web Tokens) + bcrypt password hashing |

## Features

**Storefront (customer-facing)**
- Browse/search the catalog with category, price, and sort filters, plus pagination
- Book detail pages with cover, description, metadata, and ratings
- Shopping cart with live stock checks
- Checkout with tax + shipping calculation and order confirmation
- Order history and order detail pages
- Product reviews (restricted to customers who purchased the book)
- Account registration/login and profile editing

**Admin back office** (role-gated, `ADMIN` users only)
- Dashboard: revenue, order counts, low-stock alerts, top sellers, recent orders
- Book management: create/edit/deactivate books, stock, pricing, featured flag
- Category and author management
- Order management: view all orders, update fulfillment status
- Customer list

**Business logic**
- Stock is decremented atomically at checkout (Prisma transaction); orders are blocked
  if stock is insufficient
- Books with existing order history are soft-deleted (deactivated) rather than removed,
  to keep past orders intact
- Low-stock alerts based on a per-book threshold
- Tax (8%) and flat-rate shipping (free over $50) computed both client- and server-side

## Project structure

```
backend/    Express + TypeScript API, Prisma schema, seed data
frontend/   React + TypeScript SPA (Vite)
```

## Getting started

### Prerequisites
- Node.js 18+
- npm

### 1. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy   # create the SQLite database
npm run seed                # seed sample books, categories, authors, and demo accounts
npm run dev                 # starts the API on http://localhost:4000
```

Demo accounts created by the seed script:
- **Admin:** `admin@bookstore.com` / `Admin123!`
- **Customer:** `customer@bookstore.com` / `Customer123!`

### 2. Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173 in your browser. The frontend expects the API at the URL in
`frontend/.env` (`VITE_API_URL`, defaults to `http://localhost:4000/api`).

### Production builds

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build   # outputs static assets to frontend/dist
```

## API overview

All endpoints are prefixed with `/api`.

| Resource     | Endpoints |
|--------------|-----------|
| Auth         | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/me` |
| Books        | `GET /books`, `GET /books/featured`, `GET /books/:id`, `POST/PUT/DELETE /books/:id` (admin), `PATCH /books/:id/stock` (admin) |
| Categories   | `GET /categories`, `POST/PUT/DELETE /categories/:id` (admin) |
| Authors      | `GET /authors`, `POST/PUT/DELETE /authors/:id` (admin) |
| Cart         | `GET/POST /cart`, `PUT/DELETE /cart/:bookId`, `DELETE /cart` |
| Orders       | `POST /orders` (checkout), `GET /orders`, `GET /orders/:id`, `GET /orders/all` (admin), `PATCH /orders/:id/status` (admin) |
| Reviews      | `GET /reviews/book/:bookId`, `POST /reviews/book/:bookId`, `DELETE /reviews/:id` |
| Dashboard    | `GET /dashboard/stats` (admin) |
| Users        | `GET /users` (admin) |

Protected routes require an `Authorization: Bearer <token>` header, using the token
returned from `/auth/login` or `/auth/register`.

## Notes on the data model

SQLite (via Prisma) has no native enum type, so `User.role` (`CUSTOMER`/`ADMIN`) and
`Order.status` (`PENDING`/`PAID`/`PROCESSING`/`SHIPPED`/`DELIVERED`/`CANCELLED`) are
plain strings constrained by application code. Swapping the Prisma datasource to
PostgreSQL would let you promote these back to native enums if desired.

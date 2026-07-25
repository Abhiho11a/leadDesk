# LeadDesk Mini

A modern, production-ready MVP for lead capture and management. Built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB.

## Table of Contents
- [Architecture](#architecture)
- [Data Model & Reasoning](#data-model--reasoning)
- [Authentication Approach](#authentication-approach)
- [API Contract](#api-contract)
- [Setup Instructions](#setup-instructions)

## Architecture
The project is split into two independent, deployable applications:
- `/frontend`: Frontend built with React 18, Vite, and Tailwind CSS.
- `/backend`: Backend API built with Node.js, Express, and Mongoose.

## Data Model & Reasoning

### Leads Collection
- **name**: `String` - Required, minimum 2 characters.
- **email**: `String` - Required, must match email regex.
- **budgetRange**: `String` - Required, restricted to an enum (`<1k`, `1k-5k`, `5k-10k`, `10k+`).
- **message**: `String` - Required, maximum 1000 characters.
- **status**: `String` - Enum (`New`, `Contacted`, `Closed`). Defaults to `New`.
- **createdAt**: `Date` - Defaults to current time.

*Reasoning*: The schema validates data strictly at the database level to ensure data integrity even if client-side validation is bypassed. The `status` field drives the administrative workflow in the dashboard.

### Admins Collection
- **email**: `String` - Required, unique identifier.
- **passwordHash**: `String` - Hashed password using `bcrypt`.

*Reasoning*: We only store a securely hashed version of the password, never plain text. 

## Authentication Approach

This application uses **Session-based Authentication** (`express-session` with `connect-mongo`) instead of JWTs.

*Why Sessions over JWT?*
1. **Security & Invalidation**: Sessions can be instantly invalidated on the server (e.g., via the `/auth/logout` endpoint). JWTs are generally stateless and require complex blacklisting strategies to invalidate before expiration.
2. **Simplified Client State**: The client simply sends the `httpOnly` cookie with requests via `credentials: 'include'`. This mitigates XSS risks since JavaScript cannot access the token (unlike `localStorage` which is often used for JWTs).
3. **Automatic Renewal**: Sessions naturally renew their lifetime as long as the user is active, whereas JWTs often require an extra refresh token implementation.

## API Contract

| Endpoint | Method | Protected? | Description | Request Body | Response (Success) |
| --- | --- | --- | --- | --- | --- |
| `/api/leads` | POST | No | Create a new lead | `{ name, email, budgetRange, message }` | `201 Created` - Lead object |
| `/api/leads` | GET | Yes | Fetch leads (supports `search` and `status` query params) | N/A | `200 OK` - Array of leads |
| `/api/leads/:id/status` | PATCH | Yes | Update lead status | `{ status }` | `200 OK` - Updated lead |
| `/api/auth/login` | POST | No | Authenticate admin | `{ email, password }` | `200 OK` - `{ email, id }` |
| `/api/auth/logout` | POST | No | Destroy current session | N/A | `200 OK` - `{ message }` |
| `/api/auth/me` | GET | Yes | Get current admin info | N/A | `200 OK` - Admin object |

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Atlas URI)

### 1. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Copy the example env file:
```bash
cp .env.example .env
```

Ensure `.env` contains your MongoDB URI and valid `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Run the seed script to create the initial admin user:
```bash
npm run seed
```

Start the development server:
```bash
npm run dev
```
The server will run on `http://localhost:3000`.

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Copy the example env file:
```bash
cp .env.example .env
```

Start the development server:
```bash
npm run dev
```
The client will run on `http://localhost:5173`. 

Visit `http://localhost:5173` to view the public landing page, and `http://localhost:5173/admin` to access the dashboard using the credentials you seeded.

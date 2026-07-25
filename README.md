# 🚀 LeadDesk Mini

> A high-converting, modern, production-ready full-stack web application for lead capture and pipeline management. Built with **React 18**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB**.

---

## 🌟 Overview & Highlights

LeadDesk Mini is engineered to eliminate friction in the client capture process while providing administrators with a powerful, intuitive dashboard to track and convert leads. 

Recently overhauled with a state-of-the-art UI design system, the application boasts:
- **🎨 Premium Dark Mesh & Glassmorphism**: A stunning public landing page featuring glowing animated background orbs (`animate-blob`), translucent frosted glass cards (`glass-card`), and modern typography (`Outfit` & `Inter`).
- **⚡ Zero-Friction Lead Capture**: Real-time client-side validation paired with robust backend schema enforcement ensures high conversion rates without data corruption.
- **🛡️ Secure Session-Based Auth**: Enterprise-grade authentication utilizing `httpOnly` session cookies and server-side state invalidation, avoiding common JWT client-storage vulnerabilities.
- **📊 Intuitive Pipeline Management**: A clean, responsive admin interface allowing seamless status transitions (`New` ➔ `Contacted` ➔ `Closed`) with instant optimistic UI updates.

---

## 📸 UI Showcase

### Public Landing Page (Dark Mesh & Glassmorphism)
![Landing Page - Dark Mesh & Glassmorphism](/C:/Users/abhis/.gemini/antigravity-ide/brain/1eb7573f-664c-4af0-aafa-e50d1d360298/landing_page_mockup_1784959757461.png)
*Featuring glowing background blobs, translucent form containers, and responsive error/success micro-interactions.*

### Admin Dashboard (Clean Lead Management)
![Admin Dashboard - Clean Lead Management](/C:/Users/abhis/.gemini/antigravity-ide/brain/1eb7573f-664c-4af0-aafa-e50d1d360298/admin_dashboard_mockup_1784959773367.png)
*An elevated card-based list layout with instant search, status filtering, and one-click status dropdowns.*

---

## 🔑 Admin Access Credentials

To test and evaluate the administrative workflow, use the default seeded credentials below:

- **Login URL**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

> [!TIP]
> If you ever reset your database or need to recreate this admin account, simply run `npm run seed` inside the `/backend` directory.

---

## 🛠️ Technology Stack

### Frontend (`/frontend`)
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with custom utility layers & animations
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **HTTP Client**: Axios (configured with `withCredentials: true` for cookie handling)

### Backend (`/backend`)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: `express-session` + `connect-mongo` + `bcrypt`
- **Security**: CORS restrictions, Session secret signing, strict schema validation

---

## 📦 Setup & Installation Instructions

Follow these step-by-step instructions to get the full-stack application running locally on your machine.

### Prerequisites
1. **Node.js**: Ensure you have Node.js (v18 or higher) installed.
2. **MongoDB**: A running local instance of MongoDB, or a cloud MongoDB Atlas connection URI.

---

### 1️⃣ Backend Setup (`/backend`)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your environment file by copying the example template:
   ```bash
   cp .env.example .env
   ```
   *If `.env.example` is not present, create a `.env` file with the following configuration:*
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/leaddesk
   SESSION_SECRET=super-secret-key-change-me
   ADMIN_EMAIL=admin@gmail.com
   ADMIN_PASSWORD=admin123
   CLIENT_URL=http://localhost:5173
   ```

4. Seed the database with the initial Admin user:
   ```bash
   npm run seed
   ```
   *You should see a confirmation message in the console indicating the admin user was created.*

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   ✅ The backend API will now be running on **`http://localhost:3000`**. You can verify it by visiting `http://localhost:3000/api/` in your browser.

---

### 2️⃣ Frontend Setup (`/frontend`)

1. Open a **new terminal window** and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
   *If creating manually, ensure your `.env` contains:*
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   ✅ The web application will launch at **`http://localhost:5173`**.

---

## 🧭 Application Workflow & Testing Guide

1. **Submit a Lead (Public Flow)**:
   - Go to [http://localhost:5173](http://localhost:5173).
   - Test the real-time form validation by clicking submit on an empty form.
   - Fill out the form with a name, email, budget range, and message. Upon submission, enjoy the animated checkmark confirmation!
2. **Manage Leads (Admin Flow)**:
   - Go to [http://localhost:5173/admin/login](http://localhost:5173/admin/login).
   - Enter the admin credentials (`admin@gmail.com` / `admin123`).
   - View your newly captured lead in the dashboard.
   - Test the instant search bar by typing the lead's name or email.
   - Change the lead status dropdown from **New** to **Contacted** or **Closed** and watch the status badge automatically update in real time.
3. **Log Out**:
   - Click the **Log out** button in the top right glassmorphic navbar to securely destroy your backend session.

---

## 📡 API Contract

The backend exposes the following RESTful endpoints under `/api`:

| Endpoint | Method | Protected? | Description | Request Body | Response |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `/api/` | `GET` | ❌ No | Health check endpoint | N/A | `200 OK` - `"Backend server is running"` |
| `/api/leads` | `POST` | ❌ No | Create a new lead | `{ name, email, budgetRange, message }` | `201 Created` - Lead object |
| `/api/leads` | `GET` | 🔒 Yes | Fetch all leads (supports `search` & `status` filters) | N/A | `200 OK` - Array of leads |
| `/api/leads/:id/status` | `PATCH` | 🔒 Yes | Update a lead's status | `{ status: "New" \| "Contacted" \| "Closed" }` | `200 OK` - Updated lead |
| `/api/auth/login` | `POST` | ❌ No | Authenticate admin & start session | `{ email, password }` | `200 OK` - `{ email, id }` |
| `/api/auth/logout` | `POST` | ❌ No | Destroy current admin session | N/A | `200 OK` - `{ message }` |
| `/api/auth/me` | `GET` | 🔒 Yes | Check active session admin details | N/A | `200 OK` - Admin object |

---

## 🏗️ Architectural Decisions & Security

### Why Session Authentication over JWT?
1. **Server-Side Invalidation**: Sessions allow instant revocation of access upon logout or security events. Stateless JWTs require complex blacklisting or short expiration windows that degrade UX.
2. **Mitigated XSS Vulnerabilities**: By storing the session ID inside an `httpOnly`, `secure`, and `SameSite` cookie, client-side JavaScript cannot access or exfiltrate session tokens.
3. **Seamless Sliding Expiration**: Active administrators remain logged in automatically without needing complex refresh token rotation flows on the frontend.

### Data Integrity via Schema Enforcement
Even with rich client-side validation on the frontend form, the Mongoose schema strictly restricts fields at the database level:
- Names must be at least 2 characters.
- Emails must pass strict regex validation.
- Budget ranges and statuses are locked to predefined `enum` values.
- Messages are capped at 1000 characters to prevent database bloating or denial-of-service attempts.

---
*Built with ❤️ for the Digital Heroes Training Task.*

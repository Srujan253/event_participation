# AttendQR — Event Attendance System

A full-stack **QR-based event check-in & check-out system** for admins to manage events and track attendance in real time. Built as a Progressive Web App (PWA) so it works offline and can be installed on any device.

---

## ✨ Features

- 🔐 **Admin Authentication** — JWT-based register & login
- 📅 **Event Management** — Create, view, and delete events
- 📲 **QR Code Check-In/Out** — Generate unique QR codes per event; attendees scan to check in and out
- 📊 **Live Event Stats** — View attendance counts and records per event
- 📱 **PWA Support** — Installable, works offline, mobile-friendly
- 🌐 **Cloudflare Tunnel Ready** — Share your local dev server publicly with one command

---

## 🛠 Tech Stack

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcryptjs | Authentication & password hashing |
| UUID | Unique QR token generation |
| dotenv | Environment config |
| nodemon | Dev auto-restart |

### Frontend
| Tech | Purpose |
|---|---|
| React + Vite | UI framework & dev server |
| Tailwind CSS | Utility-first styling |
| vite-plugin-pwa | Progressive Web App support |
| Workbox | Service worker & offline caching |

---

## 📁 Project Structure

```
attendee_history_managemnt/
├── backend/
│   ├── middleware/        # Auth middleware (JWT verify)
│   ├── models/            # Mongoose models (Admin, Event, Attendance)
│   ├── routes/            # Express routes (auth, events, attendance)
│   ├── server.js          # Entry point
│   └── .env               # Backend environment variables
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── AuthPage.jsx        # Login / Register
    │   │   ├── Dashboard.jsx       # Event list & management
    │   │   ├── QRDisplayPage.jsx   # Show QR code for an event
    │   │   ├── CheckInPage.jsx     # Attendee scan & check-in/out
    │   │   └── EventStatsPage.jsx  # Attendance records & stats
    │   ├── components/    # Shared UI components
    │   ├── api.js         # Centralised API calls
    │   ├── App.jsx        # Routes
    │   └── main.jsx       # Entry point
    ├── vite.config.js     # Vite + PWA + proxy config
    └── .env               # Frontend environment variables
```

---

## ⚙️ Environment Variables

### `backend/.env`
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### `frontend/.env`
```env
# Only needed if NOT using the Vite proxy (e.g. production)
# VITE_API_URL=https://your-backend-url.com
```

> In development the frontend uses the **Vite proxy** to forward `/api` requests to `localhost:5000`, so no URL env variable is required.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/attendee_history_managemnt.git
cd attendee_history_managemnt
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

Copy and fill in the values:
```bash
# In backend/
cp .env.example .env
```

### 4. Run in development

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # nodemon server.js on port 5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # Vite dev server on port 5173
```

Visit: **http://localhost:5173**

---

## 🌐 Sharing Publicly (Cloudflare Tunnel)

To test on real devices or share with others without deploying:

```bash
# Terminal 3 — Expose frontend (proxy handles backend too)
npx cloudflared tunnel --url http://localhost:5173
```

The Vite proxy automatically forwards all `/api` calls from the tunnel to your local backend — **no second tunnel needed**.

> **Note:** The tunnel URL changes every time you restart cloudflared.

---

## 🔌 API Routes

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register a new admin |
| POST | `/login` | Login, receive JWT |
| GET | `/me` | Get current admin (auth required) |

### Events — `/api/events`
| Method | Path | Description |
|---|---|---|
| GET | `/` | List all events |
| POST | `/` | Create a new event |
| GET | `/:id` | Get event details |
| GET | `/:id/stats` | Get attendance stats |
| DELETE | `/:id` | Delete an event |

### Attendance — `/api/attendance`
| Method | Path | Description |
|---|---|---|
| GET | `/verify/:token` | Validate a QR token |
| POST | `/checkin` | Check in / check out an attendee |
| GET | `/event/:eventId` | Get all attendance records for an event |

---

## 📱 PWA Installation

On mobile or desktop, open the app in the browser and look for the **"Add to Home Screen"** / **"Install"** prompt. The app will work offline after the first load thanks to Workbox service worker caching.

---

## 📄 License

MIT

# InternPulse — Intern Tracker Web Application

A full-stack intern management system built with React, Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| File Storage | Cloudinary |
| Authentication | JWT (JSON Web Tokens) |

---

## Role System

| Role | Login URL | Access |
|------|-----------|--------|
| `super_admin` | `/sa-login` | Create & manage supervisors, view all intern lists |
| `supervisor` | `/system/admin` | Create & manage own interns, tasks, submissions |
| `intern` | `/login` | View own tasks, submit updates & self-tasks |

---

## Project Structure

```
InternPulse/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Shared components
│   │   ├── context/        # Auth context
│   │   ├── pages/
│   │   │   ├── auth/       # Login pages
│   │   │   ├── intern/     # Intern dashboard
│   │   │   ├── supervisor/ # Supervisor dashboard
│   │   │   └── superadmin/ # Super admin dashboard
│   │   └── App.jsx
│   └── .env
│
└── backend/                # Node.js + Express API
    └── src/
        ├── config/         # DB + Cloudinary config
        ├── controllers/    # Route handlers
        ├── middleware/     # Auth + Upload middleware
        ├── models/         # Mongoose schemas
        ├── routes/         # Express routes
        └── server.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/internpulse.git
cd internpulse
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

---

## Seeding the Super Admin

Run this **once only** after starting the backend:

```bash
POST http://localhost:5000/api/super-admin/seed
Content-Type: application/json

{
  "name": "Super Admin",
  "email": "superadmin@internpulse.com",
  "password": "YourSecurePassword123!"
}
```

You can use Postman, Thunder Client, or any REST client.

---

## API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login for all roles |
| GET | `/api/auth/me` | Get current user |

### Users (Supervisor)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/intern` | Create intern |
| GET | `/api/users/interns` | List own interns |
| PATCH | `/api/users/intern/:id` | Edit intern |
| PATCH | `/api/users/intern/:id/toggle` | Activate / Deactivate |
| DELETE | `/api/users/intern/:id` | Delete intern |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task (supervisor) |
| GET | `/api/tasks` | Get own tasks (supervisor) |
| GET | `/api/tasks/my` | Get assigned tasks (intern) |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/updates` | Submit update / self-task (intern) |
| GET | `/api/updates` | View own interns' submissions (supervisor) |
| GET | `/api/updates/my` | View own submissions (intern) |

### Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/super-admin/seed` | Create super admin (once) |
| POST | `/api/super-admin/supervisors` | Create supervisor |
| GET | `/api/super-admin/supervisors` | List all supervisors |
| PATCH | `/api/super-admin/supervisors/:id` | Edit supervisor |
| PATCH | `/api/super-admin/supervisors/:id/toggle` | Activate / Deactivate |
| DELETE | `/api/super-admin/supervisors/:id` | Delete supervisor |
| GET | `/api/super-admin/supervisors/:id/interns` | View supervisor's interns |

---

## Environment Variables Reference

### Backend `.env`
```env
PORT=5000
MONGO_URI=              # MongoDB connection string
JWT_SECRET=             # Any long random string
CLOUDINARY_CLOUD_NAME=  # From Cloudinary dashboard
CLOUDINARY_API_KEY=     # From Cloudinary dashboard
CLOUDINARY_API_SECRET=  # From Cloudinary dashboard
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Key Features

- **Role-based access control** — Super Admin, Supervisor, Intern with isolated data
- **Intern isolation** — Supervisors only see interns they created
- **Task isolation** — Supervisors only see tasks they created; interns only see assigned tasks
- **Submission locking** — Submissions are read-only after submit (cannot edit or delete)
- **PDF reports** — Client-side PDF generation for intern lists
- **File uploads** — Cloudinary integration for avatars and submission attachments
- **Credential modal** — Login credentials shown securely after creating a user

---

## License

MIT